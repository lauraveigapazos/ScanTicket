package es.udc.tfg.scanticket.model.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService{

    @Autowired
    private JavaMailSender mailSender;

    @Value("${mailgun.from-email}")
    private String fromEmail;
    @Override
    public void sendPasswordResetEmail(String email, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("Recupera tu contraseña de ScanTicket");
            message.setText("Hola,\n\n" +
                    "Hemos recibido una solicitud para recuperar tu contraseña.\n\n" +
                    "Haz click en el siguiente enlace para establecer una nueva contraseña:\n" +
                    resetLink + "\n\n" +
                    "Este enlace expira en 1 hora.\n\n" +
                    "Si no solicitaste esto, puedes ignorar este correo.\n\n" +
                    "Saludos,\nEl equipo de ScanTicket");
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error sending email", e);
        }
    }
}
