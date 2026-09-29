import React from "react";
import renderer, { act } from "react-test-renderer";
import CategorySpendingWheel from "../../modules/app/components/statistics/CategorySpendingWheel";

//recharts needs real layout (ResizeObserver), which jsdom lacks; the legend is plain markup
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => children,
  PieChart: () => null,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
}));

const textOf = (tree) => JSON.stringify(tree.toJSON());

describe("CategorySpendingWheel", () => {
  it("lists each category with its Spanish label, amount and share", () => {
    const tree = renderer.create(
      <CategorySpendingWheel
        spendingByCategory={[
          { category: "MEAT", amount: 30 },
          { category: "Compra semanal", amount: 10 },
        ]}
      />
    );
    const text = textOf(tree);

    expect(text).toContain("Carne");
    expect(text).not.toContain("MEAT");
    expect(text).toContain("Compra semanal");
    expect(text).toContain("30.00");
    expect(text).toContain("75.0");
    expect(text).toContain("25.0");
  });

  it("switches between preferred, automatic and user categories", () => {
    const tree = renderer.create(
      <CategorySpendingWheel
        spendingByCategory={[{ category: "Compra semanal", amount: 10 }]}
        spendingByAutomaticCategory={[{ category: "MEAT", amount: 10 }]}
        spendingByUserCategory={[{ category: "Compra semanal", amount: 10 }]}
      />
    );
    const pick = (label) => {
      act(() => tree.root.find((node) => node.type === "button" && node.props["aria-haspopup"] === "menu").props.onClick());
      act(() => tree.root.find((node) => node.props.role === "menuitemradio" && node.props.children === label).props.onClick());
    };

    expect(textOf(tree)).toContain("Compra semanal");

    pick("Solo automáticas");
    expect(textOf(tree)).toContain("Carne");
    expect(textOf(tree)).not.toContain("Compra semanal");

    pick("Solo mías");
    expect(textOf(tree)).toContain("Compra semanal");
    expect(textOf(tree)).toContain("100.0");
  });

  it("shows the empty message when there are no categories", () => {
    const tree = renderer.create(<CategorySpendingWheel spendingByCategory={[]} />);

    expect(textOf(tree)).toContain("No hay datos de categorías disponibles");
  });
});
