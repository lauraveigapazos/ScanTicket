package es.udc.tfg.scanticket.model.services.exceptions;

public class InvalidImageException extends Exception{

    private final String filename;

    public InvalidImageException(String filename) {
        super("Imagen inválida: " + filename);
        this.filename = filename;
    }

    public InvalidImageException(String message, String filename) {
        super(message);
        this.filename = filename;
    }

    public String getFilename() {
        return filename;
    }
}
