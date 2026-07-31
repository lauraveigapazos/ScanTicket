package es.udc.tfg.scanticket.rest.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class ReceiptDto {

    private Long id;
    private Long userId;
    private String store;
    private String storeCif;
    private LocalDate date;
    private LocalTime time;
    private String address;
    private String phoneNumber;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal total;
    private String paymentMethod;
    private List<ReceiptItemDto> items;
    private String imagePath;
    private LocalDateTime createdAt;

    public ReceiptDto() {}

    public ReceiptDto(Long id, Long userId, String store, String storeCif, LocalDate date, LocalTime time, String address, String phoneNumber, BigDecimal subtotal, BigDecimal taxAmount, BigDecimal total, String paymentMethod, List<ReceiptItemDto> items, String imagePath, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.store = store;
        this.storeCif = storeCif;
        this.date = date;
        this.time = time;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.subtotal = subtotal;
        this.taxAmount = taxAmount;
        this.total = total;
        this.paymentMethod = paymentMethod;
        this.items = items;
        this.imagePath = imagePath;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStore() {
        return store;
    }

    public void setStore(String store) {
        this.store = store;
    }

    public String getStoreCif() {
        return storeCif;
    }

    public void setStoreCif(String storeCif) {
        this.storeCif = storeCif;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setTime(LocalTime time) {
        this.time = time;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public List<ReceiptItemDto> getItems() {
        return items;
    }

    public void setItems(List<ReceiptItemDto> items) {
        this.items = items;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
