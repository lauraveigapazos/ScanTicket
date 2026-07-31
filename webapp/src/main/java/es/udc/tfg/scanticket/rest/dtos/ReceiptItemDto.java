package es.udc.tfg.scanticket.rest.dtos;

import java.math.BigDecimal;

public class ReceiptItemDto {

    private Long id;
    private Long receiptId;
    private String name;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String category;
    private String userCategory;
    private String tax;

    public ReceiptItemDto() {}

    public ReceiptItemDto(Long id, Long receiptId, String name, BigDecimal quantity, String unit, BigDecimal unitPrice, BigDecimal totalPrice, String category, String userCategory, String tax) {
        this.id = id;
        this.receiptId = receiptId;
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
        this.category = category;
        this.userCategory = userCategory;
        this.tax = tax;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getReceiptId() {
        return receiptId;
    }

    public void setReceiptId(Long receiptId) {
        this.receiptId = receiptId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getUserCategory() {
        return userCategory;
    }

    public void setUserCategory(String userCategory) {
        this.userCategory = userCategory;
    }

    public String getTax() {
        return tax;
    }

    public void setTax(String tax) {
        this.tax = tax;
    }
}
