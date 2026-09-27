INSERT INTO Users (userName, password, firstName, lastName, email, role)
VALUES
    ('laura', '$2a$10$i.s2ePDdrDD3EWATdy3.OekvIZwrrcIKFDTSZPjHYd2.XpHeABeNy', 'Laura', 'Veiga', 'laura@email.com', 0),
    ('carlos', '$2a$10$i.s2ePDdrDD3EWATdy3.OekvIZwrrcIKFDTSZPjHYd2.XpHeABeNy', 'Carlos', 'Gómez', 'carlos@email.com', 0);

-- Mock receipts for 'laura', dated relative to the first day of the current month so statistics always have data
INSERT INTO Receipts (userId, store, receiptDate, receiptTime, total, paymentMethod)
VALUES
    (1, 'Froiz', DATEADD(DAY, 2, DATEADD(DAY, 1 - EXTRACT(DAY FROM CURRENT_DATE), CURRENT_DATE)), '10:15:00', 16.47, 'Tarjeta'),
    (1, 'Gadis', DATEADD(DAY, 6, DATEADD(DAY, 1 - EXTRACT(DAY FROM CURRENT_DATE), CURRENT_DATE)), '18:40:00', 15.95, 'Efectivo'),
    (1, 'Mercadona', DATEADD(DAY, 10, DATEADD(DAY, 1 - EXTRACT(DAY FROM CURRENT_DATE), CURRENT_DATE)), '12:05:00', 17.35, 'Tarjeta'),
    (1, 'Froiz', DATEADD(DAY, 14, DATEADD(DAY, 1 - EXTRACT(DAY FROM CURRENT_DATE), CURRENT_DATE)), '19:30:00', 25.17, 'Tarjeta'),
    (1, 'Gadis', DATEADD(DAY, 19, DATEADD(MONTH, -1, DATEADD(DAY, 1 - EXTRACT(DAY FROM CURRENT_DATE), CURRENT_DATE))), '11:20:00', 11.70, 'Efectivo');

INSERT INTO ReceiptItems (receiptId, name, quantity, unit, unitPrice, totalPrice, category, userCategory)
VALUES
    (1, 'Plátano de Canarias', 1.200, 'kg', 2.10, 2.52, 'FRUITS_VEGETABLES', NULL),
    (1, 'Tomate pera', 0.800, 'kg', 1.95, 1.56, 'FRUITS_VEGETABLES', NULL),
    (1, 'Pechuga de pollo', 1, NULL, 5.49, 5.49, 'MEAT', NULL),
    (1, 'Leche entera', 6, NULL, 0.95, 5.70, 'DAIRY_EGGS', NULL),
    (1, 'Pan de barra', 2, NULL, 0.60, 1.20, 'BAKERY', NULL),

    (2, 'Merluza', 1, NULL, 8.90, 8.90, 'FISH_SEAFOOD', NULL),
    (2, 'Huevos camperos', 1, NULL, 2.75, 2.75, 'DAIRY_EGGS', NULL),
    (2, 'Macarrones', 2, NULL, 1.10, 2.20, 'PASTA_RICE_GRAINS', NULL),
    (2, 'Agua mineral', 6, NULL, 0.35, 2.10, 'BEVERAGES', NULL),

    (3, 'Detergente líquido', 1, NULL, 6.95, 6.95, 'HOUSEHOLD_CLEANING', NULL),
    (3, 'Champú', 1, NULL, 3.20, 3.20, 'PERSONAL_CARE', NULL),
    (3, 'Vino tinto', 1, NULL, 4.50, 4.50, 'ALCOHOL', NULL),
    (3, 'Patatas fritas', 2, NULL, 1.35, 2.70, 'SNACKS', NULL),

    (4, 'Ternera picada', 1, NULL, 4.80, 4.80, 'MEAT', NULL),
    (4, 'Queso tierno', 1, NULL, 3.95, 3.95, 'DAIRY_EGGS', NULL),
    (4, 'Pizza congelada', 2, NULL, 2.49, 4.98, 'FROZEN', NULL),
    (4, 'Pienso gato', 1, NULL, 7.99, 7.99, 'PET_SUPPLIES', NULL),
    -- user override: userCategory takes priority over the predicted category
    (4, 'Atún en lata', 3, NULL, 1.15, 3.45, 'FISH_SEAFOOD', 'CANNED_PACKAGED'),

    (5, 'Manzana golden', 1.500, 'kg', 1.80, 2.70, 'FRUITS_VEGETABLES', NULL),
    (5, 'Yogur natural', 8, NULL, 0.30, 2.40, 'DAIRY_EGGS', NULL),
    (5, 'Cerveza', 12, NULL, 0.55, 6.60, 'ALCOHOL', NULL);
