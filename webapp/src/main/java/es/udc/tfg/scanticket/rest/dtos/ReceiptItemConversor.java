package es.udc.tfg.scanticket.rest.dtos;

import es.udc.tfg.scanticket.model.entities.ReceiptItem;

import java.util.List;
import java.util.stream.Collectors;

public class ReceiptItemConversor {

    private ReceiptItemConversor(){}

    public static ReceiptItem toReceiptItem(ReceiptItemDto receiptItemDto) {

        ReceiptItem receiptItem = new ReceiptItem();

        receiptItem.setId(receiptItemDto.getId());
        receiptItem.setName(receiptItemDto.getName());
        receiptItem.setQuantity(receiptItemDto.getQuantity());
        receiptItem.setUnit(receiptItemDto.getUnit());
        receiptItem.setUnitPrice(receiptItemDto.getUnitPrice());
        receiptItem.setTotalPrice(receiptItemDto.getTotalPrice());
        receiptItem.setCategory(receiptItemDto.getCategory());
        receiptItem.setTax(receiptItemDto.getTax());

        return receiptItem;
    }

    public static List<ReceiptItem> toReceiptItems(List<ReceiptItemDto> receiptItemDtos) {

        return receiptItemDtos.stream()
                .map(ReceiptItemConversor::toReceiptItem)
                .collect(Collectors.toList());
    }

    public static ReceiptItemDto toReceiptItemDto(ReceiptItem receiptItem){

        ReceiptItemDto receiptItemDto = new ReceiptItemDto();

        receiptItemDto.setId(receiptItem.getId());
        receiptItemDto.setReceiptId(receiptItem.getReceipt().getId());
        receiptItemDto.setName(receiptItem.getName());
        receiptItemDto.setQuantity(receiptItem.getQuantity());
        receiptItemDto.setUnit(receiptItem.getUnit());
        receiptItemDto.setUnitPrice(receiptItem.getUnitPrice());
        receiptItemDto.setTotalPrice(receiptItem.getTotalPrice());
        receiptItemDto.setCategory(receiptItem.getCategory());
        //receiptItemDto.setUserCategory(receiptItem.);
        receiptItemDto.setTax(receiptItem.getTax());

        return receiptItemDto;
    }

    public static List<ReceiptItemDto> toReceiptItemDtos(List<ReceiptItem> receiptItems){
        return receiptItems.stream().map(ReceiptItemConversor::toReceiptItemDto).collect(Collectors.toList());
    }
}
