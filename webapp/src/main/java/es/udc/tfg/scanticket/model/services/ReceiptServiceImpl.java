package es.udc.tfg.scanticket.model.services;

import es.udc.tfg.scanticket.model.common.exceptions.InstanceNotFoundException;
import es.udc.tfg.scanticket.model.entities.*;
import es.udc.tfg.scanticket.model.services.exceptions.InvalidImageException;
import es.udc.tfg.scanticket.model.services.exceptions.ReceiptProcessingException;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@Transactional

public class ReceiptServiceImpl implements ReceiptService{

    private final ReceiptDao receiptDao;
    private final OcrService ocrService;
    private final UserService userService;
    private final UserCategoryService userCategoryService;

    @Value("${app.upload.dir:uploads/receipts}")
    private String uploadDir;

    public ReceiptServiceImpl(ReceiptDao receiptDao, OcrService ocrService,
                              UserService userService, UserCategoryService userCategoryService){
        this.receiptDao = receiptDao;
        this.ocrService = ocrService;
        this.userService = userService;
        this.userCategoryService = userCategoryService;
    }

    @Override
    public Receipt uploadReceipt(Long userId, MultipartFile imageFile) throws InstanceNotFoundException, InvalidImageException, ReceiptProcessingException {

        User user = userService.findUserById(userId);

        if (user == null){
            throw new InstanceNotFoundException("project.entities.user", userId);
        }

        try{
            String imagePath = saveUploadedFile(imageFile, userId);
            Map<String, Object> ocrData = ocrService.extractReceiptData(imagePath);

            log.info("OCR Data extracted: {}", ocrData);
            log.info("Date from OCR: {}", ocrData.get("date"));
            log.info("Time from OCR: {}", ocrData.get("time"));

            Receipt receipt = mapOcrDataToReceipt(user, ocrData);

            log.info("Receipt after mapping - Date: {}, Time: {}", receipt.getDate(), receipt.getTime());

            receipt.setImagePath(imagePath);

            return receiptDao.save(receipt);
        }catch (InvalidImageException e) {
            throw e; //handled by controller
        }catch (Exception e){
            log.error("Error uploading receipt: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload receipt: " + e.getMessage(), e);
        }
    }

    @Override
    public String saveUploadedFile(MultipartFile file, Long userId) throws IOException, InvalidImageException {

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new InvalidImageException("El archivo debe tener un nombre válido", "");
        }

        //extension extraction -> fallback to jpg
        int lastDotIndex = originalFilename.lastIndexOf(".");
        String fileExtension = (lastDotIndex > 0) ? originalFilename.substring(lastDotIndex) : ".jpg";

        //extension validation
        String extension = fileExtension.toLowerCase();
        if (!extension.matches("\\.(jpg|jpeg|png|gif|bmp|webp)$")) {
            throw new InvalidImageException("Tipo de imagen no válido. Extensiones aceptadas: jpg, jpeg, png, gif, bmp, webp", originalFilename);
        }

        String filename = "receipt_" + userId + "_" + System.currentTimeMillis() + fileExtension;
        Path uploadPath = Paths.get(uploadDir, userId.toString());

        Files.createDirectories(uploadPath);
        Path filePath = uploadPath.resolve(filename);

        file.transferTo(filePath.toFile());
        return filePath.toAbsolutePath().toString();
    }

    @Override
    public Receipt mapOcrDataToReceipt(User user, Map<String, Object> ocrData) {

        Receipt receipt = new Receipt();
        receipt.setUser(user);

        receipt.setStore((String) ocrData.get("store"));
        receipt.setStoreCif((String) ocrData.get("store_cif"));
        receipt.setAddress((String) ocrData.get("address"));
        receipt.setPhoneNumber((String) ocrData.get("phone"));
        receipt.setPaymentMethod((String) ocrData.get("payment_method"));

        String dateStr = (String) ocrData.get("date");
        if (dateStr != null) {
            receipt.setDate(LocalDate.parse(dateStr));
        }

        String timeStr = (String) ocrData.get("time");
        if (timeStr != null) {
            receipt.setTime(LocalTime.parse(timeStr));
        }

        Object subtotalObj = ocrData.get("subtotal");
        if (subtotalObj != null) {
            receipt.setSubtotal(BigDecimal.valueOf(((Number) subtotalObj).doubleValue()));
        }

        Object taxObj = ocrData.get("tax");
        if (taxObj != null) {
            receipt.setTaxAmount(BigDecimal.valueOf(((Number) taxObj).doubleValue()));
        }

        Object totalObj = ocrData.get("total");
        if (totalObj != null) {
            receipt.setTotal(BigDecimal.valueOf(((Number) totalObj).doubleValue()));
        }

        receipt.setRawText((String) ocrData.get("raw_text"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsList = (List<Map<String, Object>>) ocrData.get("items");
        if (itemsList != null) {
            for (Map<String, Object> itemData : itemsList) {
                ReceiptItem item = new ReceiptItem();
                item.setReceipt(receipt);
                item.setName((String) itemData.get("name"));

                Object quantityObj = itemData.get("quantity");
                if (quantityObj != null) {
                    item.setQuantity(BigDecimal.valueOf(((Number) quantityObj).doubleValue()));
                }

                item.setUnit((String) itemData.get("unit"));

                Object unitPriceObj = itemData.get("unit_price");
                if (unitPriceObj != null) {
                    item.setUnitPrice(BigDecimal.valueOf(((Number) unitPriceObj).doubleValue()));
                }

                Object totalPriceObj = itemData.get("total_price");
                if (totalPriceObj != null) {
                    item.setTotalPrice(BigDecimal.valueOf(((Number) totalPriceObj).doubleValue()));
                }

                item.setCategory((String) itemData.get("category"));

                String productName = item.getName();

                //find previously used categories for this item
                if (productName != null && !productName.isBlank()) {

                    UserCategory userCategory =
                            userCategoryService.findByUserIdAndProductName(
                                    user.getId(),
                                    productName
                            );

                    if (userCategory != null) {
                        item.setUserCategory(userCategory.getCategory());
                    }
                }

                item.setTax((String) itemData.get("tax"));

                receipt.getItems().add(item);
            }
        }

        return receipt;
    }

    @Override
    @Transactional(readOnly = true)
    public Receipt findReceipt(Long userId, Long receiptId) {
        return receiptDao.findByIdAndUserId(receiptId, userId)
                .orElseThrow(() -> new RuntimeException("Receipt not found or access denied"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Receipt> findReceiptsByUser(Long userId) {
        return receiptDao.findByUserIdOrderByDateDesc(userId);
    }

    @Override
    @Transactional(rollbackFor = InstanceNotFoundException.class)
    public void updateReceipt(Long userId, Long receiptId, String store, String storeCif, LocalDate date, LocalTime time,
                       String address, String phoneNumber, BigDecimal subtotal, BigDecimal taxAmount, BigDecimal total,
                       String paymentMethod, List<ReceiptItem> items) throws InstanceNotFoundException{

        Receipt receipt = receiptDao.findByIdAndUserId(receiptId, userId)
                .orElseThrow(() -> new InstanceNotFoundException("project.entities.receipt", receiptId));

        receipt.setStore(store);
        receipt.setStoreCif(storeCif);
        receipt.setDate(date);
        receipt.setTime(time);
        receipt.setAddress(address);
        receipt.setPhoneNumber(phoneNumber);
        receipt.setSubtotal(subtotal);
        receipt.setTaxAmount(taxAmount);
        receipt.setTotal(total);
        receipt.setPaymentMethod(paymentMethod);

        if (items != null){
            for (ReceiptItem itemUpdate : items){
                ReceiptItem item = receipt.getItems().stream()
                        .filter(i -> i.getId().equals(itemUpdate.getId()))
                        .findFirst()
                        .orElseThrow(() -> new InstanceNotFoundException("project.entities.receiptItem", itemUpdate.getId()));

                item.setName(itemUpdate.getName());
                item.setQuantity(itemUpdate.getQuantity());
                item.setUnit(itemUpdate.getUnit());
                item.setUnitPrice(itemUpdate.getUnitPrice());
                item.setTotalPrice(itemUpdate.getTotalPrice());
                item.setCategory(itemUpdate.getCategory());
                item.setTax(itemUpdate.getTax());
                item.setUserCategory(itemUpdate.getUserCategory());

                //save user category
                if (itemUpdate.getUserCategory() != null
                        && !itemUpdate.getUserCategory().isBlank()
                        && itemUpdate.getName() != null
                        && !itemUpdate.getName().isBlank()){
                    userCategoryService.saveCategory(userId, itemUpdate.getName(), itemUpdate.getUserCategory());
                }
            }
        }
        receiptDao.save(receipt);
    }


    @Override
    public void deleteReceipt(Long userId, Long receiptId) {
        Receipt receipt = receiptDao.findByIdAndUserId(receiptId, userId)
                .orElseThrow(() -> new RuntimeException("Receipt not found or access denied"));

        receiptDao.delete(receipt);
    }

    @Override
    public List<Receipt> findReceiptsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {

        return receiptDao.findByUserIdAndDateBetween(userId, startDate, endDate);
    }
}
