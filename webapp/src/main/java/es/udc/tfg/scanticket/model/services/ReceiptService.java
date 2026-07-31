package es.udc.tfg.scanticket.model.services;

import es.udc.tfg.scanticket.model.common.exceptions.InstanceNotFoundException;
import es.udc.tfg.scanticket.model.entities.Receipt;
import es.udc.tfg.scanticket.model.entities.ReceiptItem;
import es.udc.tfg.scanticket.model.entities.User;
import es.udc.tfg.scanticket.model.services.exceptions.InvalidImageException;
import es.udc.tfg.scanticket.model.services.exceptions.ReceiptProcessingException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ReceiptService {

    Receipt uploadReceipt(Long userId, MultipartFile imageFile) throws InstanceNotFoundException, InvalidImageException, ReceiptProcessingException;

    String saveUploadedFile(MultipartFile file, Long userId) throws IOException, InvalidImageException;

    Receipt mapOcrDataToReceipt(User user, Map<String, Object> ocrData);

    Receipt findReceipt(Long userId, Long receiptId);

    List<Receipt> findReceiptsByUser(Long userId);

    ReceiptItem updateReceiptItem(Long userId, Long receiptId, Long itemId, String userCategory);

    void deleteReceipt(Long userId, Long receiptId);

    List<Receipt> findReceiptsByDateRange(Long userId, LocalDate startDate, LocalDate endDate);
}
