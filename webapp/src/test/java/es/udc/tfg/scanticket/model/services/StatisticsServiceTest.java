package es.udc.tfg.scanticket.model.services;

import es.udc.tfg.scanticket.model.entities.Receipt;
import es.udc.tfg.scanticket.model.entities.ReceiptDao;
import es.udc.tfg.scanticket.model.entities.ReceiptItem;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.*;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class StatisticsServiceTest {

    private StatisticsService statisticsService;

    @MockBean
    private ReceiptDao receiptDao;

    private List<Receipt> testReceipts;
    private Long testUserId = 1L;

    @Before
    public void setUp() {
        statisticsService = new StatisticsServiceImpl(receiptDao);

        java.lang.reflect.Field field;
        try {
            field = StatisticsServiceImpl.class.getDeclaredField("receiptDao");
            field.setAccessible(true);
            field.set(statisticsService, receiptDao);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        testReceipts = createTestReceipts();
    }

    private List<Receipt> createTestReceipts() {
        List<Receipt> receipts = new ArrayList<>();

        //july 1st: 25.50€
        Receipt receipt1 = new Receipt();
        receipt1.setId(1L);
        receipt1.setDate(LocalDate.of(2025, 7, 1));
        receipt1.setTime(LocalTime.of(10, 0));
        receipt1.setTotal(BigDecimal.valueOf(25.50));
        receipt1.setStore("Store A");

        List<ReceiptItem> items1 = new ArrayList<>();
        ReceiptItem item1a = new ReceiptItem();
        item1a.setName("Milk");
        item1a.setTotalPrice(BigDecimal.valueOf(3.50));
        item1a.setCategory("Dairy");
        item1a.setUserCategory(null);
        items1.add(item1a);

        ReceiptItem item1b = new ReceiptItem();
        item1b.setName("Bread");
        item1b.setTotalPrice(BigDecimal.valueOf(22.00));
        item1b.setCategory("Bakery");
        item1b.setUserCategory(null);
        items1.add(item1b);

        receipt1.setItems(items1);
        receipts.add(receipt1);

        //july 1st: 15.00€
        Receipt receipt2 = new Receipt();
        receipt2.setId(2L);
        receipt2.setDate(LocalDate.of(2025, 7, 1));
        receipt2.setTime(LocalTime.of(14, 30));
        receipt2.setTotal(BigDecimal.valueOf(15.00));
        receipt2.setStore("Store B");

        List<ReceiptItem> items2 = new ArrayList<>();
        ReceiptItem item2a = new ReceiptItem();
        item2a.setName("Chicken");
        item2a.setTotalPrice(BigDecimal.valueOf(10.00));
        item2a.setCategory("Meat");
        item2a.setUserCategory("Proteins"); //user override
        items2.add(item2a);

        ReceiptItem item2b = new ReceiptItem();
        item2b.setName("Vegetables");
        item2b.setTotalPrice(BigDecimal.valueOf(5.00));
        item2b.setCategory("Produce");
        item2b.setUserCategory(null);
        items2.add(item2b);

        receipt2.setItems(items2);
        receipts.add(receipt2);

        //july 5th: 30.75€
        Receipt receipt3 = new Receipt();
        receipt3.setId(3L);
        receipt3.setDate(LocalDate.of(2025, 7, 5));
        receipt3.setTime(LocalTime.of(11, 15));
        receipt3.setTotal(BigDecimal.valueOf(30.75));
        receipt3.setStore("Store C");

        List<ReceiptItem> items3 = new ArrayList<>();
        ReceiptItem item3a = new ReceiptItem();
        item3a.setName("Coffee");
        item3a.setTotalPrice(BigDecimal.valueOf(15.00));
        item3a.setCategory("Beverages");
        item3a.setUserCategory(null);
        items3.add(item3a);

        ReceiptItem item3b = new ReceiptItem();
        item3b.setName("Snacks");
        item3b.setTotalPrice(BigDecimal.valueOf(15.75));
        item3b.setCategory("Snacks");
        item3b.setUserCategory(null);
        items3.add(item3b);

        receipt3.setItems(items3);
        receipts.add(receipt3);

        //july 10th: 45.25€
        Receipt receipt4 = new Receipt();
        receipt4.setId(4L);
        receipt4.setDate(LocalDate.of(2025, 7, 10));
        receipt4.setTime(LocalTime.of(16, 45));
        receipt4.setTotal(BigDecimal.valueOf(45.25));
        receipt4.setStore("Store D");

        List<ReceiptItem> items4 = new ArrayList<>();
        ReceiptItem item4a = new ReceiptItem();
        item4a.setName("Pasta");
        item4a.setTotalPrice(BigDecimal.valueOf(25.25));
        item4a.setCategory("Grains");
        item4a.setUserCategory(null);
        items4.add(item4a);

        ReceiptItem item4b = new ReceiptItem();
        item4b.setName("Cheese");
        item4b.setTotalPrice(BigDecimal.valueOf(20.00));
        item4b.setCategory("Dairy");
        item4b.setUserCategory(null);
        items4.add(item4b);

        receipt4.setItems(items4);
        receipts.add(receipt4);

        return receipts;
    }

    //helper method to avoid 10.5 != 10.50 assertion errors
    private void assertBigDecimalEquals(BigDecimal expected, Object actual) {
        assertEquals(0, expected.compareTo((BigDecimal) actual));
    }

    @Test
    public void testGetTotalSpent_Success() {
        LocalDate startDate = LocalDate.of(2025, 7, 1);
        LocalDate endDate = LocalDate.of(2025, 7, 31);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(testReceipts);

        BigDecimal total = statisticsService.getTotalSpent(testUserId, startDate, endDate);

        assertBigDecimalEquals(BigDecimal.valueOf(116.50), total);
    }

    @Test
    public void testGetTotalSpent_NoReceipts() {
        LocalDate startDate = LocalDate.of(2025, 8, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 31);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(new ArrayList<>());

        BigDecimal total = statisticsService.getTotalSpent(testUserId, startDate, endDate);

        assertEquals(BigDecimal.ZERO, total);
    }

    @Test
    public void testGetReceiptCount_Success() {
        LocalDate startDate = LocalDate.of(2025, 7, 1);
        LocalDate endDate = LocalDate.of(2025, 7, 31);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(testReceipts);

        int count = statisticsService.getReceiptCount(testUserId, startDate, endDate);

        assertEquals(4, count);
    }

    @Test
    public void testGetReceiptCount_NoReceipts() {
        LocalDate startDate = LocalDate.of(2025, 8, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 31);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(new ArrayList<>());

        int count = statisticsService.getReceiptCount(testUserId, startDate, endDate);

        assertEquals(0, count);
    }

    @Test
    public void testGetAverageSpendingPerDay_Success() {
        LocalDate startDate = LocalDate.of(2025, 7, 1);
        LocalDate endDate = LocalDate.of(2025, 7, 31);

        //total: 116.50
        //days with receipts: 3
        //average: 38.83
        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(testReceipts);

        BigDecimal average = statisticsService.getAverageSpendingPerDay(testUserId, startDate, endDate);

        assertEquals(BigDecimal.valueOf(38.83), average);
    }

    @Test
    public void testGetAverageSpendingPerDay_SingleDay() {
        LocalDate startDate = LocalDate.of(2025, 7, 1);
        LocalDate endDate = LocalDate.of(2025, 7, 1);

        List<Receipt> singleDayReceipts = new ArrayList<>();
        Receipt receipt = new Receipt();
        receipt.setId(1L);
        receipt.setDate(LocalDate.of(2025, 7, 1));
        receipt.setTotal(BigDecimal.valueOf(40.50));
        singleDayReceipts.add(receipt);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(singleDayReceipts);

        BigDecimal average = statisticsService.getAverageSpendingPerDay(testUserId, startDate, endDate);

        assertBigDecimalEquals(BigDecimal.valueOf(40.50), average);
    }

    @Test
    public void testGetAverageSpendingPerDay_NoReceipts() {
        LocalDate startDate = LocalDate.of(2025, 8, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 31);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(new ArrayList<>());

        BigDecimal average = statisticsService.getAverageSpendingPerDay(testUserId, startDate, endDate);

        assertEquals(BigDecimal.ZERO, average);
    }

    @Test
    public void testGetDailySpending_Success() {
        LocalDate startDate = LocalDate.of(2025, 7, 1);
        LocalDate endDate = LocalDate.of(2025, 7, 10);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(testReceipts);

        Map<LocalDate, BigDecimal> dailySpending = statisticsService.getDailySpending(testUserId, startDate, endDate);

        assertEquals(10, dailySpending.size());

        //july 1st: 40.50
        assertEquals(BigDecimal.valueOf(40.50), dailySpending.get(LocalDate.of(2025, 7, 1)));

        //july 5th: 30.75
        assertEquals(BigDecimal.valueOf(30.75), dailySpending.get(LocalDate.of(2025, 7, 5)));

        //july 10th: 45.25
        assertEquals(BigDecimal.valueOf(45.25), dailySpending.get(LocalDate.of(2025, 7, 10)));

        //days without receipts: 0
        assertEquals(BigDecimal.ZERO, dailySpending.get(LocalDate.of(2025, 7, 2)));
        assertEquals(BigDecimal.ZERO, dailySpending.get(LocalDate.of(2025, 7, 3)));
    }

    @Test
    public void testGetDailySpending_NoReceipts() {
        LocalDate startDate = LocalDate.of(2025, 8, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 3);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(new ArrayList<>());

        Map<LocalDate, BigDecimal> dailySpending = statisticsService.getDailySpending(testUserId, startDate, endDate);

        assertEquals(3, dailySpending.size());
        assertEquals(BigDecimal.ZERO, dailySpending.get(LocalDate.of(2025, 8, 1)));
        assertEquals(BigDecimal.ZERO, dailySpending.get(LocalDate.of(2025, 8, 2)));
        assertEquals(BigDecimal.ZERO, dailySpending.get(LocalDate.of(2025, 8, 3)));
    }

    @Test
    public void testGetSpendingByCategory_Success() {
        LocalDate startDate = LocalDate.of(2025, 7, 1);
        LocalDate endDate = LocalDate.of(2025, 7, 31);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(testReceipts);

        Map<String, BigDecimal> spendingByCategory = statisticsService.getSpendingByCategory(testUserId, startDate, endDate);

        assertNotNull(spendingByCategory);
        assertFalse(spendingByCategory.isEmpty());

        //grains: 25.25
        assertBigDecimalEquals(BigDecimal.valueOf(25.25), spendingByCategory.get("Grains"));
        //dairy: 23.50
        assertBigDecimalEquals(BigDecimal.valueOf(23.50), spendingByCategory.get("Dairy"));
        //proteins: 10.00
        assertBigDecimalEquals(BigDecimal.valueOf(10.00), spendingByCategory.get("Proteins"));
        //beverages: 15.00
        assertBigDecimalEquals(BigDecimal.valueOf(15.00), spendingByCategory.get("Beverages"));
        //produce: 5.00
        assertBigDecimalEquals(BigDecimal.valueOf(5.00), spendingByCategory.get("Produce"));
        //bakery: 22.00
        assertBigDecimalEquals(BigDecimal.valueOf(22.00), spendingByCategory.get("Bakery"));
        //snacks: 15.75
        assertBigDecimalEquals(BigDecimal.valueOf(15.75), spendingByCategory.get("Snacks"));
    }

    @Test
    public void testGetSpendingByCategory_UserCategoryOverride() {
        LocalDate startDate = LocalDate.of(2025, 7, 1);
        LocalDate endDate = LocalDate.of(2025, 7, 1);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(testReceipts.subList(0, 2)); // Only first two receipts

        Map<String, BigDecimal> spendingByCategory = statisticsService.getSpendingByCategory(testUserId, startDate, endDate);

        //usercategory overrides category
        assertTrue(spendingByCategory.containsKey("Proteins"));
        assertFalse(spendingByCategory.containsKey("Meat"));
        assertBigDecimalEquals(BigDecimal.valueOf(10.00), spendingByCategory.get("Proteins"));
    }

    @Test
    public void testGetSpendingByCategory_NoReceipts() {
        LocalDate startDate = LocalDate.of(2025, 8, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 31);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(new ArrayList<>());

        Map<String, BigDecimal> spendingByCategory = statisticsService.getSpendingByCategory(testUserId, startDate, endDate);

        assertTrue(spendingByCategory.isEmpty());
    }

    @Test
    public void testGetSpendingByCategory_UncategorizedItems() {
        LocalDate startDate = LocalDate.of(2025, 7, 1);
        LocalDate endDate = LocalDate.of(2025, 7, 31);

        Receipt receiptWithUncategorized = new Receipt();
        receiptWithUncategorized.setId(99L);
        receiptWithUncategorized.setDate(LocalDate.of(2025, 7, 15));
        receiptWithUncategorized.setTotal(BigDecimal.valueOf(10.00));
        receiptWithUncategorized.setStore("Store X");

        List<ReceiptItem> items = new ArrayList<>();
        ReceiptItem uncategorizedItem = new ReceiptItem();
        uncategorizedItem.setName("Mystery Item");
        uncategorizedItem.setTotalPrice(BigDecimal.valueOf(10.00));
        uncategorizedItem.setCategory(null);
        uncategorizedItem.setUserCategory(null);
        items.add(uncategorizedItem);

        receiptWithUncategorized.setItems(items);
        List<Receipt> receiptsWithUncategorized = new ArrayList<>(testReceipts);
        receiptsWithUncategorized.add(receiptWithUncategorized);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(receiptsWithUncategorized);

        Map<String, BigDecimal> spendingByCategory = statisticsService.getSpendingByCategory(testUserId, startDate, endDate);

        assertTrue(spendingByCategory.containsKey("Uncategorized"));
        assertBigDecimalEquals(BigDecimal.valueOf(10.00), spendingByCategory.get("Uncategorized"));
    }

    @Test
    public void testGetStatistics_Success() {
        LocalDate startDate = LocalDate.of(2025, 7, 1);
        LocalDate endDate = LocalDate.of(2025, 7, 31);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(testReceipts);

        Map<String, Object> stats = statisticsService.getStatistics(testUserId, startDate, endDate);

        assertBigDecimalEquals(BigDecimal.valueOf(116.50), stats.get("totalSpent"));
        assertEquals(4, stats.get("receiptCount"));
        assertEquals(BigDecimal.valueOf(38.83), stats.get("averageSpendingPerDay"));
        assertEquals(YearMonth.of(2025, 7), stats.get("period"));

        @SuppressWarnings("unchecked")
        Map<LocalDate, BigDecimal> dailySpending = (Map<LocalDate, BigDecimal>) stats.get("dailySpending");
        assertNotNull(dailySpending);
        assertEquals(31, dailySpending.size());

        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> spendingByCategory = (Map<String, BigDecimal>) stats.get("spendingByCategory");
        assertNotNull(spendingByCategory);
        assertFalse(spendingByCategory.isEmpty());
        assertTrue(spendingByCategory.containsKey("Dairy"));
        assertTrue(spendingByCategory.containsKey("Proteins"));
    }

    @Test
    public void testGetStatistics_WithNullDates_DefaultsToCurrentMonth() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startOfMonth, endOfMonth))
                .thenReturn(testReceipts);

        Map<String, Object> stats = statisticsService.getStatistics(testUserId, null, null);

        assertNotNull(stats);
        assertBigDecimalEquals(BigDecimal.valueOf(116.50), stats.get("totalSpent"));
        assertEquals(YearMonth.now(), stats.get("period"));
        assertNotNull(stats.get("spendingByCategory"));
    }

    @Test
    public void testGetStatistics_NoReceipts() {
        LocalDate startDate = LocalDate.of(2025, 8, 1);
        LocalDate endDate = LocalDate.of(2025, 8, 31);

        when(receiptDao.findByUserIdAndDateBetween(testUserId, startDate, endDate))
                .thenReturn(new ArrayList<>());

        Map<String, Object> stats = statisticsService.getStatistics(testUserId, startDate, endDate);

        assertEquals(BigDecimal.ZERO, stats.get("totalSpent"));
        assertEquals(0, stats.get("receiptCount"));
        assertEquals(BigDecimal.ZERO, stats.get("averageSpendingPerDay"));

        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> spendingByCategory = (Map<String, BigDecimal>) stats.get("spendingByCategory");
        assertTrue(spendingByCategory.isEmpty());
    }
}
