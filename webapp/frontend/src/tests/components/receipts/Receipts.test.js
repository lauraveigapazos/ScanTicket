import React from "react";
import { act, fireEvent, screen } from "@testing-library/react";
import ReceiptCard from "../../../modules/app/components/receipts/ReceiptCard";
import ReceiptHistory from "../../../modules/app/components/receipts/ReceiptHistory";
import ReceiptDetails from "../../../modules/app/components/receipts/ReceiptDetails";
import EditReceipt from "../../../modules/app/components/receipts/EditReceipt";
import ReceiptUpload from "../../../modules/app/components/receipts/ReceiptUpload";
import ReceiptUploadCard from "../../../modules/app/components/receipts/ReceiptUploadCard";
import {
  deleteReceipt,
  getReceipt,
  getUserReceipts,
  updateReceipt,
  uploadReceipt,
} from "../../../backend/receiptService";
import { renderWithRouter } from "../../renderWithRouter";

jest.mock("../../../backend/receiptService", () => ({
  deleteReceipt: jest.fn(),
  getReceipt: jest.fn(),
  getUserReceipts: jest.fn(),
  updateReceipt: jest.fn(),
  uploadReceipt: jest.fn(),
}));

const receipt = {
  id: 1,
  store: "Froiz",
  date: "2026-09-03",
  time: "10:15:00",
  total: 16.47,
  items: [{ id: 1, name: "Leche entera", quantity: 6, unitPrice: 0.95, totalPrice: 5.7 }],
};

beforeEach(() => jest.clearAllMocks());

describe("ReceiptCard", () => {
  const mountCard = (onDeleted = jest.fn()) => {
    renderWithRouter(<ReceiptCard receipt={receipt} onDeleted={onDeleted} />);
    return onDeleted;
  };

  it("opens the receipt details on click", () => {
    mountCard();

    fireEvent.click(screen.getByText("Froiz"));

    expect(screen.getByTestId("location")).toHaveTextContent("/receipts/1");
  });

  it("opens the edit page without opening the details", () => {
    mountCard();

    fireEvent.click(screen.getByLabelText("Editar recibo"));

    expect(screen.getByTestId("location")).toHaveTextContent("/receipts/1/edit");
  });

  it("deletes only after confirmation", () => {
    deleteReceipt.mockImplementation((id, onSuccess) => onSuccess());
    const onDeleted = mountCard();

    fireEvent.click(screen.getByLabelText("Eliminar recibo"));
    expect(deleteReceipt).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(deleteReceipt.mock.calls[0][0]).toBe(1);
    expect(onDeleted).toHaveBeenCalledWith(1);
  });

  it("keeps the receipt and shows a generic message when delete fails", () => {
    deleteReceipt.mockImplementation((id, onSuccess, onErrors) => onErrors({ globalError: "internal" }));
    const onDeleted = mountCard();

    fireEvent.click(screen.getByLabelText("Eliminar recibo"));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(screen.getByText("No se pudo eliminar el recibo")).toBeInTheDocument();
    expect(onDeleted).not.toHaveBeenCalled();
  });
});

describe("ReceiptHistory", () => {
  it("lists receipts newest first", () => {
    getUserReceipts.mockImplementation((onSuccess) =>
      onSuccess([
        { id: 1, store: "Old store", date: "2026-08-01" },
        { id: 2, store: "New store", date: "2026-09-01" },
      ])
    );
    renderWithRouter(<ReceiptHistory />);

    const stores = screen.getAllByText(/store$/).map((node) => node.textContent);

    expect(stores).toEqual(["New store", "Old store"]);
    expect(screen.getByText("2 recibos")).toBeInTheDocument();
  });

  it("offers a retry when loading fails", () => {
    getUserReceipts.mockImplementation((onSuccess, onErrors) => onErrors({}));
    renderWithRouter(<ReceiptHistory />);

    expect(screen.getByText("No se pudo cargar el historial de recibos")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(getUserReceipts).toHaveBeenCalledTimes(2);
  });
});

describe("ReceiptDetails", () => {
  const renderDetails = () => renderWithRouter(<ReceiptDetails />, { path: "/receipts/:receiptId", route: "/receipts/1" });

  it("loads the receipt from the URL id and formats money in euros", () => {
    getReceipt.mockImplementation((id, onSuccess) => onSuccess(receipt));
    renderDetails();

    expect(getReceipt.mock.calls[0][0]).toBe("1");
    expect(screen.getByText("Leche entera")).toBeInTheDocument();
    expect(screen.getAllByText(/16,47\s€/).length).toBeGreaterThan(0);
  });

  it("shows a generic error when the receipt cannot be loaded", () => {
    getReceipt.mockImplementation((id, onSuccess, onErrors) => onErrors({}));
    renderDetails();

    expect(screen.getByText("No se pudo cargar el recibo")).toBeInTheDocument();
  });

  it("opens the edit page from the header", () => {
    getReceipt.mockImplementation((id, onSuccess) => onSuccess(receipt));
    renderDetails();

    fireEvent.click(screen.getByLabelText("Editar recibo"));

    expect(screen.getByTestId("location")).toHaveTextContent("/receipts/1/edit");
  });
});

describe("EditReceipt", () => {
  const renderEdit = () => {
    getReceipt.mockImplementation((id, onSuccess) => onSuccess(receipt));
    return renderWithRouter(<EditReceipt />, { path: "/receipts/:receiptId/edit", route: "/receipts/1/edit" });
  };

  it("saves the edited receipt and returns to its details", () => {
    updateReceipt.mockImplementation((id, data, onSuccess) => onSuccess());
    renderEdit();

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { name: "store", value: "Gadis" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(updateReceipt.mock.calls[0][0]).toBe("1");
    expect(updateReceipt.mock.calls[0][1].store).toBe("Gadis");
    expect(screen.getByTestId("location")).toHaveTextContent("/receipts/1");
  });

  it("stays on the page with a message when saving fails", () => {
    updateReceipt.mockImplementation((id, data, onSuccess, onErrors) => onErrors({}));
    renderEdit();

    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(screen.getByText("No se pudo guardar el recibo")).toBeInTheDocument();
  });
});

describe("ReceiptUploadCard", () => {
  const selectFile = (file) =>
    fireEvent.change(screen.getByLabelText(/Toca para cargar/), { target: { files: [file] } });

  it("rejects files that are not images", () => {
    renderWithRouter(<ReceiptUploadCard />);

    selectFile(new File(["x"], "notes.txt", { type: "text/plain" }));

    expect(screen.getByText("Por favor selecciona una imagen válida")).toBeInTheDocument();
  });

  it("rejects images over 5MB", () => {
    renderWithRouter(<ReceiptUploadCard />);
    const bigImage = new File(["x"], "big.jpg", { type: "image/jpeg" });
    Object.defineProperty(bigImage, "size", { value: 5 * 1024 * 1024 + 1 });

    selectFile(bigImage);

    expect(screen.getByText("La imagen no puede exceder 5MB")).toBeInTheDocument();
  });

  it("uploads the selected image as the 'image' form field", async () => {
    uploadReceipt.mockImplementation((formData, onSuccess, onErrors) => onErrors({ globalError: "Formato no soportado" }));
    renderWithRouter(<ReceiptUploadCard />);
    const image = new File(["x"], "ticket.jpg", { type: "image/jpeg" });

    selectFile(image);
    fireEvent.click(await screen.findByRole("button", { name: "Subir recibo" }));

    expect(uploadReceipt.mock.calls[0][0].get("image")).toBe(image);
    expect(screen.getByText("Formato no soportado")).toBeInTheDocument();
  });
});

describe("ReceiptUpload", () => {
  afterEach(() => jest.useRealTimers());

  it("opens the uploaded receipt's details after a successful upload", async () => {
    uploadReceipt.mockImplementation((formData, onSuccess) => onSuccess({ id: 7 }));
    renderWithRouter(<ReceiptUpload />);

    fireEvent.change(screen.getByLabelText(/Toca para cargar/), {
      target: { files: [new File(["x"], "ticket.jpg", { type: "image/jpeg" })] },
    });
    const uploadButton = await screen.findByRole("button", { name: "Subir recibo" });
    jest.useFakeTimers();
    fireEvent.click(uploadButton);
    act(() => jest.runAllTimers());

    expect(screen.getByTestId("location")).toHaveTextContent("/receipts/7");
  });
});
