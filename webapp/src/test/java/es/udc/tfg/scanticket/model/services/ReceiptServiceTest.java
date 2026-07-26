package es.udc.tfg.scanticket.model.services;

import es.udc.tfg.scanticket.model.common.exceptions.InstanceNotFoundException;
import es.udc.tfg.scanticket.model.entities.Receipt;
import es.udc.tfg.scanticket.model.entities.ReceiptDao;
import es.udc.tfg.scanticket.model.entities.ReceiptItem;
import es.udc.tfg.scanticket.model.entities.User;
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

    @Test(expected = IllegalArgumentException.class)
    public void testSaveUploadedFile_NullFilename() throws IOException{

        MultipartFile file = new MockMultipartFile(
                "image",
                null,
                "image/jpeg",
                "content".getBytes()
        );

        receiptService.saveUploadedFile(file, 1L);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testSaveUploadedFile_InvalidExtension() throws IOException{

        MultipartFile file = new MockMultipartFile(
                "image",
                "malicious.exe",
                "image/jpeg",
                "content".getBytes()
        );

        receiptService.saveUploadedFile(file, 1L);
    }

    @Test
    public void testUploadReceipt_Success() throws InstanceNotFoundException, IOException, InterruptedException{

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

    @Test(expected = RuntimeException.class)
    public void testUpdateReceiptItem_ReceiptNotFound(){

        when(receiptDao.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        receiptService.updateReceiptItem(1L, 999L, 1L, "Alimentación");
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
