package es.udc.tfg.scanticket.rest.dtos;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

public class StatisticsDto {

    private YearMonth period;
    private BigDecimal totalSpent;
    private int receiptCount;
    private BigDecimal averageSpendingPerDay;
    private List<DailySpendingDto> dailySpending;
    private List<CategorySpendingDto> spendingByCategory;

    public StatisticsDto() {
    }

    public StatisticsDto(YearMonth period,
                         BigDecimal totalSpent, int receiptCount, BigDecimal averageSpendingPerDay,
                         List<DailySpendingDto> dailySpending, List<CategorySpendingDto> spendingByCategory) {
        this.period = period;
        this.totalSpent = totalSpent;
        this.receiptCount = receiptCount;
        this.averageSpendingPerDay = averageSpendingPerDay;
        this.dailySpending = dailySpending;
        this.spendingByCategory = spendingByCategory;
    }

    public YearMonth getPeriod() {
        return period;
    }

    public void setPeriod(YearMonth period) {
        this.period = period;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }

    public int getReceiptCount() {
        return receiptCount;
    }

    public void setReceiptCount(int receiptCount) {
        this.receiptCount = receiptCount;
    }

    public BigDecimal getAverageSpendingPerDay() {
        return averageSpendingPerDay;
    }

    public void setAverageSpendingPerDay(BigDecimal averageSpendingPerDay) {
        this.averageSpendingPerDay = averageSpendingPerDay;
    }

    public List<DailySpendingDto> getDailySpending() {
        return dailySpending;
    }

    public void setDailySpending(List<DailySpendingDto> dailySpending) {
        this.dailySpending = dailySpending;
    }

    public List<CategorySpendingDto> getSpendingByCategory() {
        return spendingByCategory;
    }

    public void setSpendingByCategory(List<CategorySpendingDto> spendingByCategory) {
        this.spendingByCategory = spendingByCategory;
    }
}
