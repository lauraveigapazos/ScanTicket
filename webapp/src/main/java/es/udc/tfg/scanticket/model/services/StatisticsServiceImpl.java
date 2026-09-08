package es.udc.tfg.scanticket.model.services;

import es.udc.tfg.scanticket.model.entities.Receipt;
import es.udc.tfg.scanticket.model.entities.ReceiptDao;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class StatisticsServiceImpl implements StatisticsService{

    private final ReceiptDao receiptDao;

    public StatisticsServiceImpl(ReceiptDao receiptDao){
        this.receiptDao = receiptDao;
    }
    @Override
    public Map<String, Object> getStatistics(Long userId, LocalDate startDate, LocalDate endDate) {

        //if dates are null -> current month stats
        if (startDate == null || endDate == null){
            LocalDate today = LocalDate.now();
            startDate = today.withDayOfMonth(1);
            endDate = today.withDayOfMonth(today.lengthOfMonth());
        }

        BigDecimal totalSpent = getTotalSpent(userId, startDate, endDate);
        int receiptCount = getReceiptCount(userId, startDate, endDate);
        BigDecimal averageSpendingPerDay = getAverageSpendingPerDay(userId, startDate, endDate);
        Map<LocalDate, BigDecimal> dailySpending = getDailySpending(userId, startDate, endDate);
        Map<String, BigDecimal> spendingByCategory = getSpendingByCategory(userId, startDate, endDate);
        YearMonth period = YearMonth.from(startDate);

        Map<String, Object> result = new HashMap<>();
        result.put("totalSpent", totalSpent);
        result.put("receiptCount", receiptCount);
        result.put("averageSpendingPerDay", averageSpendingPerDay);
        result.put("dailySpending", dailySpending);
        result.put("spendingByCategory", spendingByCategory);
        result.put("period", period);

        return result;
    }

    @Override
    public BigDecimal getTotalSpent(Long userId, LocalDate startDate, LocalDate endDate) {

        List<Receipt> receipts = receiptDao.findByUserIdAndDateBetween(userId, startDate, endDate);
        return receipts.stream()
                .map(Receipt::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public int getReceiptCount(Long userId, LocalDate startDate, LocalDate endDate) {

        List<Receipt> receipts = receiptDao.findByUserIdAndDateBetween(userId, startDate, endDate);
        return receipts.size();
    }

    @Override
    public BigDecimal getAverageSpendingPerDay(Long userId, LocalDate startDate, LocalDate endDate) {

        List<Receipt> receipts = receiptDao.findByUserIdAndDateBetween(userId, startDate, endDate);
        BigDecimal totalSpent = getTotalSpent(userId, startDate, endDate);
        Set<LocalDate> daysWithReceipts = receipts.stream()
                .map(Receipt::getDate)
                .collect(java.util.stream.Collectors.toSet());

        //no receipts
        if (daysWithReceipts.isEmpty()) {
            return BigDecimal.ZERO;
        }

        //result with 2 decimals
        return totalSpent.divide(
                new BigDecimal(daysWithReceipts.size()),
                2,
                RoundingMode.HALF_UP
        );
    }

    @Override
    public Map<LocalDate, BigDecimal> getDailySpending(Long userId, LocalDate startDate, LocalDate endDate) {

        List<Receipt> receipts = receiptDao.findByUserIdAndDateBetween(userId, startDate, endDate);
        Map<LocalDate, BigDecimal> dailyTotals = new TreeMap<>();

        //initialize days to 0
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            dailyTotals.put(current, BigDecimal.ZERO);
            current = current.plusDays(1);
        }

        //group by date
        receipts.forEach(receipt -> {
            LocalDate receiptDate = receipt.getDate();
            BigDecimal currentTotal = dailyTotals.getOrDefault(receiptDate, BigDecimal.ZERO);
            dailyTotals.put(receiptDate, currentTotal.add(receipt.getTotal()));
        });

        return dailyTotals;
    }

    @Override
    public Map<String, BigDecimal> getSpendingByCategory(Long userId, LocalDate startDate, LocalDate endDate) {

        List<Receipt> receipts = receiptDao.findByUserIdAndDateBetween(userId, startDate, endDate);
        Map<String, BigDecimal> categorySpending = new TreeMap<>();

        receipts.forEach(receipt -> {
            receipt.getItems().forEach(item -> {
                //priority: usercategory > category
                String categoryToUse = (item.getUserCategory() != null && !item.getUserCategory().isBlank())
                        ? item.getUserCategory()
                        : item.getCategory();

                //fallback
                if (categoryToUse == null || categoryToUse.isBlank()) {
                    categoryToUse = "Uncategorized";
                }

                BigDecimal currentTotal = categorySpending.getOrDefault(categoryToUse, BigDecimal.ZERO);
                categorySpending.put(categoryToUse, currentTotal.add(item.getTotalPrice()));
            });
        });

        //sort by spending amount descending
        return categorySpending.entrySet()
                .stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .collect(java.util.stream.Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }
}
