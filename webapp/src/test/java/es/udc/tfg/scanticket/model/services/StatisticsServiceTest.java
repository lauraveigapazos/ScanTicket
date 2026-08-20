package es.udc.tfg.scanticket.model.services;

import es.udc.tfg.scanticket.model.entities.Receipt;
import es.udc.tfg.scanticket.model.entities.ReceiptDao;
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
        receipts.add(receipt1);

        //july 1st: 15.00€
        Receipt receipt2 = new Receipt();
        receipt2.setId(2L);
        receipt2.setDate(LocalDate.of(2025, 7, 1));
        receipt2.setTime(LocalTime.of(14, 30));
        receipt2.setTotal(BigDecimal.valueOf(15.00));
        receipt2.setStore("Store B");
        receipts.add(receipt2);

        //july 5th: 30.75€
        Receipt receipt3 = new Receipt();
        receipt3.setId(3L);
        receipt3.setDate(LocalDate.of(2025, 7, 5));
        receipt3.setTime(LocalTime.of(11, 15));
        receipt3.setTotal(BigDecimal.valueOf(30.75));
        receipt3.setStore("Store C");
        receipts.add(receipt3);

        //july 10th: 45.25€
        Receipt receipt4 = new Receipt();
        receipt4.setId(4L);
        receipt4.setDate(LocalDate.of(2025, 7, 10));
        receipt4.setTime(LocalTime.of(16, 45));
        receipt4.setTotal(BigDecimal.valueOf(45.25));
        receipt4.setStore("Store D");
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
    }
}
