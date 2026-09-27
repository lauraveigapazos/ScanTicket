import React from "react";
import { MemoryRouter } from "react-router-dom";
import renderer, { act } from "react-test-renderer";
import Analysis from "../../modules/app/components/statistics/Analysis";
import CategorySpendingWheel from "../../modules/app/components/statistics/CategorySpendingWheel";
import { getStatisticsByDateRange } from "../../backend/statisticsService";

jest.mock("../../backend/statisticsService", () => ({
  getStatisticsByDateRange: jest.fn(),
}));

//recharts needs real layout (ResizeObserver), which jsdom lacks
jest.mock("../../modules/app/components/statistics/CategorySpendingWheel", () => () => null);
jest.mock("../../modules/app/components/statistics/DailySpendingChart", () => () => null);

const statisticsWith = (overrides) => ({
  totalSpent: 0,
  receiptCount: 0,
  averageSpendingPerDay: 0,
  dailySpending: [{ day: 1, amount: 0 }],
  spendingByCategory: [],
  ...overrides,
});

const mountAnalysis = (statistics) => {
  getStatisticsByDateRange.mockImplementation((startDate, endDate, onSuccess) => onSuccess(statistics));
  let component;
  act(() => {
    component = renderer.create(
      <MemoryRouter>
        <Analysis />
      </MemoryRouter>
    );
  });
  return component;
};

const textOf = (component) => JSON.stringify(component.toJSON());

describe("Analysis", () => {
  beforeEach(() => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(new Date(2026, 8, 15));
    getStatisticsByDateRange.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("requests the whole current month regardless of timezone", () => {
    mountAnalysis(statisticsWith({}));

    const [startDate, endDate] = getStatisticsByDateRange.mock.calls[0];
    expect(startDate).toBe("2026-09-01");
    expect(endDate).toBe("2026-09-30");
  });

  it("shows the category wheel when there are receipts", () => {
    const spendingByCategory = [{ category: "MEAT", amount: 12.5 }];
    const component = mountAnalysis(statisticsWith({ receiptCount: 1, totalSpent: 12.5, spendingByCategory }));

    const wheels = component.root.findAll((node) => node.type === CategorySpendingWheel);
    expect(wheels).toHaveLength(1);
    expect(wheels[0].props.spendingByCategory).toEqual(spendingByCategory);
    expect(textOf(component)).not.toContain("No hay datos disponibles para este período");
  });

  it("shows the empty state instead of the wheel when there are no receipts", () => {
    const component = mountAnalysis(statisticsWith({ receiptCount: 0 }));

    expect(component.root.findAll((node) => node.type === CategorySpendingWheel)).toHaveLength(0);
    expect(textOf(component)).toContain("No hay datos disponibles para este período");
  });
});
