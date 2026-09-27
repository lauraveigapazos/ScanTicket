import React from "react";
import { screen } from "@testing-library/react";
import Home from "../../modules/app/components/Home";
import { getReceiptImage, getUserReceipts } from "../../backend/receiptService";
import { getCurrentMonthStatistics } from "../../backend/statisticsService";
import { tryLoginFromServiceToken } from "../../backend/userService";
import { renderWithRouter } from "../renderWithRouter";

jest.mock("../../backend/userService", () => ({ tryLoginFromServiceToken: jest.fn(), logout: jest.fn() }));
jest.mock("../../backend/statisticsService", () => ({ getCurrentMonthStatistics: jest.fn() }));
jest.mock("../../backend/receiptService", () => ({
  getUserReceipts: jest.fn(),
  getReceiptImage: jest.fn(),
  uploadReceipt: jest.fn(),
}));

const statistics = {
  totalSpent: 16.47,
  receiptCount: 1,
  averageSpendingPerDay: 16.47,
  dailySpending: [{ day: 1, amount: 16.47 }],
};

const renderHome = (receipts) => {
  getUserReceipts.mockImplementation((onSuccess) => onSuccess(receipts));
  getCurrentMonthStatistics.mockImplementation((onSuccess) => onSuccess(statistics));
  return renderWithRouter(<Home />);
};

describe("Home", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tryLoginFromServiceToken.mockImplementation((onSuccess) => onSuccess({ user: { id: 1 } }));
  });

  it("shows this month's statistics and receipts when there is data", () => {
    renderHome([{ id: 1, store: "Froiz", date: "2026-09-03", time: "10:15:00", total: 16.47 }]);

    expect(screen.getByText("Froiz")).toBeInTheDocument();
    expect(screen.getByText("Total gastado")).toBeInTheDocument();
    expect(screen.queryByText("Añadir nuevo recibo")).not.toBeInTheDocument();
    expect(getReceiptImage).not.toHaveBeenCalled();
  });

  it("offers the upload card when there are no receipts", () => {
    renderHome([]);

    expect(screen.getByText("Añadir nuevo recibo")).toBeInTheDocument();
    expect(screen.getByText("Carga tu primer recibo para comenzar")).toBeInTheDocument();
    expect(screen.queryByText("Total gastado")).not.toBeInTheDocument();
  });

  it("shows a message when receipts cannot be loaded", () => {
    getUserReceipts.mockImplementation((onSuccess, onErrors) => onErrors({}));
    renderWithRouter(<Home />);

    expect(screen.getByText("Error al cargar los recibos")).toBeInTheDocument();
  });
});
