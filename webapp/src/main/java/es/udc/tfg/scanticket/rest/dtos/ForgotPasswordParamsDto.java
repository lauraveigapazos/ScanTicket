package es.udc.tfg.scanticket.rest.dtos;

public class ForgotPasswordParamsDto {

    private String email;

    public ForgotPasswordParamsDto() {
    }

    public ForgotPasswordParamsDto(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
