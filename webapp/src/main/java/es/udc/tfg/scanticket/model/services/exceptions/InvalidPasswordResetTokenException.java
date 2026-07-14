package es.udc.tfg.scanticket.model.services.exceptions;

@SuppressWarnings("serial")
public class InvalidPasswordResetTokenException extends Exception{

    private static final long serialVersionUID = 1L;

    public InvalidPasswordResetTokenException(String token) {
        super("Invalid or expired password reset token: " + token);
    }
}
