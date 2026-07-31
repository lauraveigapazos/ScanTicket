package es.udc.tfg.scanticket.rest.controllers;

import es.udc.tfg.scanticket.model.common.exceptions.InstanceNotFoundException;
import es.udc.tfg.scanticket.model.entities.Receipt;
import es.udc.tfg.scanticket.model.entities.User;
import es.udc.tfg.scanticket.model.services.ReceiptService;
import es.udc.tfg.scanticket.model.services.UserService;
import es.udc.tfg.scanticket.model.services.exceptions.InvalidImageException;
import es.udc.tfg.scanticket.model.services.exceptions.ReceiptProcessingException;
import es.udc.tfg.scanticket.rest.common.ErrorsDto;
import es.udc.tfg.scanticket.rest.dtos.ReceiptConversor;
import es.udc.tfg.scanticket.rest.dtos.ReceiptDto;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private static final String INVALID_IMAGE_EXCEPTION_CODE = "project.exceptions.InvalidImageException";
    private static final String RECEIPT_PROCESSING_EXCEPTION_CODE = "project.exceptions.ReceiptProcessingException";

    private final ReceiptService receiptService;
    private final UserService userService;
    private final MessageSource messageSource;

    public ReceiptController(ReceiptService receiptService, UserService userService, MessageSource messageSource){
        this.receiptService = receiptService;
        this.userService = userService;
        this.messageSource = messageSource;
    }

    @ExceptionHandler(InvalidImageException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorsDto handleInvalidImageException(InvalidImageException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(INVALID_IMAGE_EXCEPTION_CODE,
                new Object[] { exception.getFilename() }, exception.getMessage(), locale);
        return new ErrorsDto(errorMessage);
    }

    @ExceptionHandler(ReceiptProcessingException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorsDto handleReceiptProcessingException(ReceiptProcessingException exception, Locale locale) {
        String errorMessage = messageSource.getMessage(RECEIPT_PROCESSING_EXCEPTION_CODE,
                new Object[] { exception.getMessage() }, exception.getMessage(), locale);
        return new ErrorsDto(errorMessage);
    }

    @PostMapping
    public ResponseEntity<ReceiptDto> uploadReceipt(@RequestAttribute Long userId, @RequestParam("image") MultipartFile imageFile)
            throws InvalidImageException, ReceiptProcessingException, InstanceNotFoundException{

        User user = userService.loginFromId(userId);

        if (imageFile.isEmpty()){
            throw new InvalidImageException("El archivo está vacío", imageFile.getOriginalFilename());
        }

        String contentType = imageFile.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidImageException("El archivo debe ser una imagen válida", imageFile.getOriginalFilename());
        }

        Receipt receipt = receiptService.uploadReceipt(userId, imageFile);
        ReceiptDto receiptDto = ReceiptConversor.toReceiptDto(receipt);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(receipt.getId())
                .toUri();

        return ResponseEntity.created(location).body(receiptDto);
    }

    @GetMapping("/{receiptId}")
    public ResponseEntity<ReceiptDto> getReceipt(@RequestAttribute Long userId, @PathVariable Long receiptId){

        try {
            Receipt receipt = receiptService.findReceipt(userId, receiptId);
            ReceiptDto receiptDto = ReceiptConversor.toReceiptDto(receipt);
            return ResponseEntity.ok(receiptDto);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping
    public ResponseEntity<List<ReceiptDto>> getUserReceipts(@RequestAttribute Long userId){

        List<Receipt> receipts = receiptService.findReceiptsByUser(userId);
        List<ReceiptDto> receiptDtos = ReceiptConversor.toReceiptDtos(receipts);
        return ResponseEntity.ok(receiptDtos);
    }
}
