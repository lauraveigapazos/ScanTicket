import React from "react";
import renderer from "react-test-renderer";
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

  it("shows the empty message when there are no categories", () => {
    const tree = renderer.create(<CategorySpendingWheel spendingByCategory={[]} />);

    expect(textOf(tree)).toContain("No hay datos de categorías disponibles");
  });
});
