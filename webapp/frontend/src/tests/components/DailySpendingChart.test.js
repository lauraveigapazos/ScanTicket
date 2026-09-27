import React from "react";
import { render, screen } from "@testing-library/react";
import DailySpendingChart from "../../modules/app/components/statistics/DailySpendingChart";

//recharts needs real layout (ResizeObserver), which jsdom lacks; render the Y axis ticks as text
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => children,
  LineChart: ({ children }) => <div>{children}</div>,
  YAxis: ({ ticks, tickFormatter }) => ticks.map((tick) => <span key={tick}>{tickFormatter(tick)}</span>),
  XAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Line: () => null,
}));

describe("DailySpendingChart", () => {
  it("renders nothing without data", () => {
    const { container } = render(<DailySpendingChart dailySpending={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("scales the axis to the highest day, with a 100€ minimum", () => {
    const days = (amounts) => amounts.map((amount, index) => ({ day: index + 1, amount }));

    const { rerender } = render(<DailySpendingChart dailySpending={days([20, 250, 40])} />);
    expect(screen.getByText("€250")).toBeInTheDocument();
    expect(screen.getByText("€125")).toBeInTheDocument();

    rerender(<DailySpendingChart dailySpending={days([20, 40])} />);
    expect(screen.getByText("€100")).toBeInTheDocument();
  });
});
