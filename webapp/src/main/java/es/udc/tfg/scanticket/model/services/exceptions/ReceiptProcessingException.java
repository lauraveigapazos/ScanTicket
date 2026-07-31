package es.udc.tfg.scanticket.model.services.exceptions;

public class ReceiptProcessingException extends Exception{

    private final String receiptId;

    public ReceiptProcessingException(String message, String receiptId) {
        super(message);
        this.receiptId = receiptId;
    }

    public String getReceiptId() {
        return receiptId;
    }
}
