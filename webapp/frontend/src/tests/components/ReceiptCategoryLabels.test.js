import React from "react";
import { MemoryRouter } from "react-router-dom";
import renderer, { act } from "react-test-renderer";
import ReceiptDetails from "../../modules/app/components/receipts/ReceiptDetails";
import EditReceipt from "../../modules/app/components/receipts/EditReceipt";
import { getReceipt } from "../../backend/receiptService";

jest.mock("../../backend/receiptService", () => ({
  getReceipt: jest.fn(),
  updateReceipt: jest.fn(),
}));

const receipt = {
  id: 1,
  store: "Froiz",
  date: "2026-09-03",
  total: 3.45,
  items: [
    {
      id: 1,
      name: "Atún en lata",
      quantity: 3,
      unitPrice: 1.15,
      totalPrice: 3.45,
      category: "FISH_SEAFOOD",
      userCategory: "CANNED_PACKAGED",
    },
  ],
};

const mount = (element) => {
  getReceipt.mockImplementation((receiptId, onSuccess) => onSuccess(receipt));
  let tree;
  act(() => {
    tree = renderer.create(<MemoryRouter>{element}</MemoryRouter>);
  });
  return tree;
};

describe("receipt category labels", () => {
  it("ReceiptDetails shows user and detected categories in Spanish", () => {
    const text = JSON.stringify(mount(<ReceiptDetails />).toJSON());

    expect(text).toContain("Conservas y envasados");
    expect(text).toContain("Pescado y marisco");
    expect(text).not.toContain("FISH_SEAFOOD");
  });

  it("EditReceipt shows the detected category in Spanish", () => {
    const tree = mount(<EditReceipt />);
    const readOnlyInputs = tree.root.findAll((node) => node.type === "input" && node.props.readOnly);

    expect(readOnlyInputs.map((input) => input.props.value)).toContain("Pescado y marisco");
  });
});
