package es.udc.tfg.scanticket.model.services;

public interface EmailService {

    void sendPasswordResetEmail(String email, String resetLink);
}
