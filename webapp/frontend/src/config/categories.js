// Codes come from the OCR classifier (python_ocr/categorization/examples.py) and the backend fallback
const CATEGORY_LABELS = {
    FRUITS_VEGETABLES: "Frutas y verduras",
    MEAT: "Carne",
    FISH_SEAFOOD: "Pescado y marisco",
    DAIRY_EGGS: "Lácteos y huevos",
    BAKERY: "Panadería",
    PASTA_RICE_GRAINS: "Pasta, arroz y cereales",
    CANNED_PACKAGED: "Conservas y envasados",
    SNACKS: "Snacks",
    BEVERAGES: "Bebidas",
    ALCOHOL: "Alcohol",
    FROZEN: "Congelados",
    HOUSEHOLD_CLEANING: "Limpieza del hogar",
    PERSONAL_CARE: "Cuidado personal",
    PET_SUPPLIES: "Mascotas",
    OTHER: "Otros",
    Uncategorized: "Sin categoría",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS);

// user categories are free text, so unknown values are shown as typed
export const categoryLabel = (category) => CATEGORY_LABELS[category] ?? category;
