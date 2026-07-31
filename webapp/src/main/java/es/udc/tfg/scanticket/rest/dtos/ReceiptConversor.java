package es.udc.tfg.scanticket.rest.dtos;

import es.udc.tfg.scanticket.model.entities.Receipt;

import java.util.List;
import java.util.stream.Collectors;

import static es.udc.tfg.scanticket.rest.dtos.ReceiptItemConversor.toReceiptItemDtos;

public class ReceiptConversor {

    private ReceiptConversor() {
    }

    public static ReceiptDto toReceiptDto(Receipt receipt){

        ReceiptDto receiptDto = new ReceiptDto();

        receiptDto.setId(receipt.getId());
        receiptDto.setUserId(receipt.getUser().getId());
        receiptDto.setStore(receipt.getStore());
        receiptDto.setStoreCif(receipt.getStoreCif());
        receiptDto.setDate(receipt.getDate());
        receiptDto.setTime(receipt.getTime());
        receiptDto.setAddress(receipt.getAddress());
        receiptDto.setPhoneNumber(receipt.getPhoneNumber());
        receiptDto.setSubtotal(receipt.getSubtotal());
        receiptDto.setTaxAmount(receipt.getTaxAmount());
        receiptDto.setTotal(receipt.getTotal());
        receiptDto.setPaymentMethod(receipt.getPaymentMethod());
        receiptDto.setItems(toReceiptItemDtos(receipt.getItems() != null ? receipt.getItems() : List.of()));
        receiptDto.setImagePath(receipt.getImagePath());
        receiptDto.setCreatedAt(receipt.getCreatedAt());

        return receiptDto;
    }

    public static List<ReceiptDto> toReceiptDtos(List<Receipt> receipts){
        return receipts.stream().map(ReceiptConversor::toReceiptDto).collect(Collectors.toList());
    }
}
