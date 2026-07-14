DROP TABLE IF EXISTS ReceiptItems;
DROP TABLE IF EXISTS Receipts;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(60) NOT NULL,
    password VARCHAR(60) NOT NULL, 
    firstName VARCHAR(60) NOT NULL,
    lastName VARCHAR(60) NOT NULL, 
    email VARCHAR(60) NOT NULL,
    role TINYINT NOT NULL,
    passwordResetToken VARCHAR(255),
    passwordResetTokenExpiration DATETIME
);

CREATE TABLE Receipts (
    id BIGINT NOT NULL AUTO_INCREMENT,
    userId BIGINT NOT NULL,
    store VARCHAR(100),
    storeCif VARCHAR(20),
    receiptDate DATE,
    receiptTime TIME,
    address VARCHAR(255),
    phone VARCHAR(20),
    subtotal DECIMAL(10, 2),
    taxAmount DECIMAL(10, 2),
    total DECIMAL(10, 2) NOT NULL,
    paymentMethod VARCHAR(50),
    rawText LONGTEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_receipts PRIMARY KEY (id),
    CONSTRAINT fk_user FOREIGN KEY (userId)
        REFERENCES Users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE ReceiptItems (
    id BIGINT NOT NULL AUTO_INCREMENT,
    receiptId BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL,
    unit VARCHAR(20),
    unitPrice DECIMAL(10, 2) NOT NULL,
    totalPrice DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    userCategory VARCHAR(100),
    tax VARCHAR(10),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_receipt_items PRIMARY KEY (id),
    CONSTRAINT fk_receipt FOREIGN KEY (receiptId)
        REFERENCES Receipts(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

