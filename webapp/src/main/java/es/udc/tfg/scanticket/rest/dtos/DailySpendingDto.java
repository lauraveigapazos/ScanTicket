package es.udc.tfg.scanticket.rest.dtos;

import java.math.BigDecimal;

public class DailySpendingDto {

    private int day;
    private BigDecimal amount;

    public DailySpendingDto() {
    }

    public DailySpendingDto(int day, BigDecimal amount) {
        this.day = day;
        this.amount = amount;
    }

    public int getDay() {
        return day;
    }

    public void setDay(int day) {
        this.day = day;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
