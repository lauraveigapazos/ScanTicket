import { categoryLabel } from "../config/categories";

describe("categoryLabel", () => {
  it("translates classifier codes and the backend fallback to Spanish", () => {
    expect(categoryLabel("MEAT")).toBe("Carne");
    expect(categoryLabel("DAIRY_EGGS")).toBe("Lácteos y huevos");
    expect(categoryLabel("Uncategorized")).toBe("Sin categoría");
  });

  it("keeps free-text user categories and empty values as they are", () => {
    expect(categoryLabel("Compra semanal")).toBe("Compra semanal");
    expect(categoryLabel(null)).toBeNull();
    expect(categoryLabel(undefined)).toBeUndefined();
  });
});
