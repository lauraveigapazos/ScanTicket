package es.udc.tfg.scanticket.model.services;

import es.udc.tfg.scanticket.model.common.exceptions.InstanceNotFoundException;
import es.udc.tfg.scanticket.model.entities.Receipt;
import es.udc.tfg.scanticket.model.entities.ReceiptDao;
import es.udc.tfg.scanticket.model.entities.ReceiptItem;
import es.udc.tfg.scanticket.model.entities.User;
import es.udc.tfg.scanticket.model.services.exceptions.InvalidImageException;
import es.udc.tfg.scanticket.model.services.exceptions.ReceiptProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Slf4j
public class ReceiptServiceTest {

    private ReceiptService receiptService;

    @MockBean
    private ReceiptDao receiptDao;

    @MockBean
    private OcrService ocrService;

    @MockBean
    private UserService userService;

    private User testUser;
    private Receipt testReceipt;

    @Before
    public void setUp(){

        receiptService = new ReceiptServiceImpl(receiptDao, ocrService, userService);

        testUser = new User("testUser", "password", "Test", "User", "test@test.com");
        testUser.setId(1L);

        testReceipt = new Receipt();
        testReceipt.setId(1L);
        testReceipt.setUser(testUser);
        testReceipt.setStore("Test Store");
        testReceipt.setTotal(BigDecimal.valueOf(25.50));
        testReceipt.setDate(LocalDate.of(2025, 7, 15));
        testReceipt.setTime(LocalTime.of(14, 30, 0));
    }

    @Test
    public void testMapOcrDataToReceipt_Success(){

        Map<String, Object> ocrData = createMockOcrData();

        Receipt receipt = receiptService.mapOcrDataToReceipt(testUser, ocrData);

        assertNotNull(receipt);
        assertEquals("Froiz", receipt.getStore());
        assertEquals("A36036739", receipt.getStoreCif());
        assertEquals(LocalDate.parse("2025-10-31"), receipt.getDate());
        assertEquals(LocalTime.parse("14:11:00"), receipt.getTime());
        assertEquals(BigDecimal.valueOf(3.58), receipt.getTotal());
        assertEquals("Tarjeta", receipt.getPaymentMethod());
        assertEquals(testUser, receipt.getUser());
    }

    @Test
    public void testMapOcrDataToReceipt_WithNullFields(){

        Map<String, Object> ocrData = new HashMap<>();
        ocrData.put("store", "Test Store");
        ocrData.put("total", 10.0);
        ocrData.put("subtotal", null);
        ocrData.put("tax_amount", null);
        ocrData.put("date", null);
        ocrData.put("time", null);

        Receipt receipt = receiptService.mapOcrDataToReceipt(testUser, ocrData);

        assertNotNull(receipt);
        assertEquals("Test Store", receipt.getStore());
        assertEquals(BigDecimal.valueOf(10.0), receipt.getTotal());
        assertNull(receipt.getDate());
        assertNull(receipt.getTime());
        assertNull(receipt.getSubtotal());
    }

    @Test
    public void testMapOcrDataToReceipt_WithItems(){
        Map<String, Object> ocrData = createMockOcrData();

        Receipt receipt = receiptService.mapOcrDataToReceipt(testUser, ocrData);

        assertNotNull(receipt.getItems());
        assertEquals(1, receipt.getItems().size());

        ReceiptItem item = receipt.getItems().get(0);
        assertEquals("Pila Froiz", item.getName());
        assertEquals(0, item.getQuantity().compareTo(BigDecimal.valueOf(1)));
        assertEquals("ud", item.getUnit());
        assertEquals(0, item.getUnitPrice().compareTo(BigDecimal.valueOf(1.0)));
        assertEquals(0, item.getTotalPrice().compareTo(BigDecimal.valueOf(1.0)));
        assertEquals("drogueria", item.getCategory());
        assertEquals("21%", item.getTax());
    }

    @Test(expected = InvalidImageException.class)
    public void testSaveUploadedFile_NullFilename() throws IOException, InvalidImageException {

        MultipartFile file = new MockMultipartFile(
                "image",
                null,
                "image/jpeg",
                "content".getBytes()
        );

        receiptService.saveUploadedFile(file, 1L);
    }

    @Test(expected = InvalidImageException.class)
    public void testSaveUploadedFile_InvalidExtension() throws IOException, InvalidImageException{

        MultipartFile file = new MockMultipartFile(
                "image",
                "malicious.exe",
                "image/jpeg",
                "content".getBytes()
        );

        receiptService.saveUploadedFile(file, 1L);
    }

    @Test
    public void testUploadReceipt_Success() throws InstanceNotFoundException, IOException, InterruptedException, InvalidImageException, ReceiptProcessingException {

        //mock dependencies
        when(userService.findUserById(1L)).thenReturn(testUser);
        when(ocrService.extractReceiptData(anyString())).thenReturn(createMockOcrData());
        when(receiptDao.save(any(Receipt.class))).thenReturn(testReceipt);

        byte[] content = "fake image".getBytes();
        MultipartFile file = new MockMultipartFile(
                "image",
                "receipt.jpg",
                "image/jpeg",
                content
        );

        //mock file saving
        ReceiptService spyService = spy(receiptService);
        doReturn("/fake/path/receipt_1_123456.jpg").when(spyService).saveUploadedFile(file, 1L);

        Receipt result = spyService.uploadReceipt(1L, file);

        assertNotNull(result);
        assertEquals("Test Store", result.getStore());
        verify(userService, times(1)).findUserById(1L);
        verify(ocrService, times(1)).extractReceiptData(anyString());
        verify(receiptDao, times(1)).save(any(Receipt.class));
    }

    @Test
    public void testUpdateReceipt_Success() throws InstanceNotFoundException {

        when(receiptDao.findByIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(testReceipt));

        receiptService.updateReceipt(1L, 1L, "Updated Store", "B12345678",
                LocalDate.of(2025, 8, 1), LocalTime.of(10, 30),
                "Updated Address", "600123456", BigDecimal.valueOf(20.00),
                BigDecimal.valueOf(2.00), BigDecimal.valueOf(22.00), "CARD");

        assertEquals("Updated Store", testReceipt.getStore());
        assertEquals("B12345678", testReceipt.getStoreCif());
        assertEquals(LocalDate.of(2025, 8, 1), testReceipt.getDate());
        assertEquals(LocalTime.of(10, 30), testReceipt.getTime());
        assertEquals("Updated Address", testReceipt.getAddress());
        assertEquals("600123456", testReceipt.getPhoneNumber());
        assertEquals(BigDecimal.valueOf(20.00), testReceipt.getSubtotal());
        assertEquals(BigDecimal.valueOf(2.00), testReceipt.getTaxAmount());
        assertEquals(BigDecimal.valueOf(22.00), testReceipt.getTotal());
        assertEquals("CARD", testReceipt.getPaymentMethod());

        verify(receiptDao).save(testReceipt);
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testUpdateReceipt_ReceiptNotFound() throws InstanceNotFoundException {

        when(receiptDao.findByIdAndUserId(999L, 1L))
                .thenReturn(Optional.empty());

        receiptService.updateReceipt(
                1L,
                999L,
                "Updated Store",
                "B12345678",
                LocalDate.of(2025, 8, 1),
                LocalTime.of(10, 30),
                "Updated Address",
                "600123456",
                BigDecimal.valueOf(20.00),
                BigDecimal.valueOf(2.00),
                BigDecimal.valueOf(22.00),
                "CARD"
        );
    }

    @Test
    public void testUpdateReceiptItem_Success() throws InstanceNotFoundException {

        ReceiptItem item = new ReceiptItem();
        item.setId(1L);
        item.setName("Old Product");
        item.setQuantity(BigDecimal.ONE);
        item.setUnit("unit");
        item.setUnitPrice(BigDecimal.valueOf(2.00));
        item.setTotalPrice(BigDecimal.valueOf(2.00));
        item.setCategory("Other");
        item.setTax("21%");

        testReceipt.setItems(new ArrayList<>());
        testReceipt.getItems().add(item);

        when(receiptDao.findByIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(testReceipt));

        receiptService.updateReceiptItem(1L, 1L, 1L, "New Product",
                BigDecimal.valueOf(2), "kg", BigDecimal.valueOf(3.50), BigDecimal.valueOf(7.00),
                "Alimentación", "10%");

        assertEquals("New Product", item.getName());
        assertEquals(BigDecimal.valueOf(2), item.getQuantity());
        assertEquals("kg", item.getUnit());
        assertEquals(BigDecimal.valueOf(3.50), item.getUnitPrice());
        assertEquals(BigDecimal.valueOf(7.00), item.getTotalPrice());
        assertEquals("Alimentación", item.getCategory());
        assertEquals("10%", item.getTax());

        verify(receiptDao).save(testReceipt);
    }

    @Test(expected = InstanceNotFoundException.class)
    public void testUpdateReceiptItem_ReceiptNotFound() throws InstanceNotFoundException {

        when(receiptDao.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        receiptService.updateReceiptItem(1L, 999L, 1L, "Test Product",
                BigDecimal.ONE, "unit", BigDecimal.valueOf(2.50), BigDecimal.valueOf(2.50),
                "Alimentación", "21%");
    }

    @Test(expected = RuntimeException.class)
    public void testUpdateReceiptItem_ItemNotFound() throws InstanceNotFoundException {

        testReceipt.setItems(new ArrayList<>());

        when(receiptDao.findByIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(testReceipt));

        receiptService.updateReceiptItem(1L, 1L, 999L, "New Product",
                BigDecimal.ONE, "unit", BigDecimal.valueOf(2.50), BigDecimal.valueOf(2.50),
                "Alimentación", "21%");
    }

    @Test
    public void testDeleteReceipt_Success(){

        when(receiptDao.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(testReceipt));

        receiptService.deleteReceipt(1L, 1L);

        verify(receiptDao, times(1)).findByIdAndUserId(1L, 1L);
        verify(receiptDao, times(1)).delete(testReceipt);
    }

    @Test(expected = RuntimeException.class)
    public void testDeleteReceipt_NotFound(){

        when(receiptDao.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        receiptService.deleteReceipt(1L, 999L);
    }

    //helper method
    private Map<String, Object> createMockOcrData(){

        Map<String, Object> ocrData = new HashMap<>();
        ocrData.put("store", "Froiz");
        ocrData.put("store_cif", "A36036739");
        ocrData.put("date", "2025-10-31");
        ocrData.put("time", "14:11:00");
        ocrData.put("address", "Avda. De Oza, 16");
        ocrData.put("phone_number", "981173354");
        ocrData.put("subtotal", null);
        ocrData.put("tax_amount", null);
        ocrData.put("total", 3.58);
        ocrData.put("payment_method", "Tarjeta");
        ocrData.put("raw_text", "test raw text");

        //items
        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> item = new HashMap<>();
        item.put("name", "Pila Froiz");
        item.put("quantity", 1);
        item.put("unit", "ud");
        item.put("unit_price", 1.0);
        item.put("total_price", 1.0);
        item.put("category", "drogueria");
        item.put("tax", "21%");
        items.add(item);

        ocrData.put("items", items);

        return ocrData;
    }
}
