package es.udc.tfg.scanticket.model.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public interface StatisticsService {

    Map<String, Object> getStatistics(Long userId, LocalDate startDate, LocalDate endDate);
    BigDecimal getTotalSpent(Long userId, LocalDate startDate, LocalDate endDate);
    int getReceiptCount(Long userId, LocalDate startDate, LocalDate endDate);
    BigDecimal getAverageSpendingPerDay(Long userId, LocalDate startDate, LocalDate endDate);
    Map<LocalDate, BigDecimal> getDailySpending(Long userId, LocalDate startDate, LocalDate endDate);
}
