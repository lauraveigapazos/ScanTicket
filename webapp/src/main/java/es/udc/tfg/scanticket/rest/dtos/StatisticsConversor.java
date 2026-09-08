package es.udc.tfg.scanticket.rest.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class StatisticsConversor  {

    private StatisticsConversor(){
    }

    @SuppressWarnings("unchecked")
    public static StatisticsDto toStatisticsDto(Map<String, Object> statistics){

        StatisticsDto statisticsDto = new StatisticsDto();

        statisticsDto.setPeriod((YearMonth) statistics.get("period"));
        statisticsDto.setTotalSpent((BigDecimal) statistics.get("totalSpent"));
        statisticsDto.setReceiptCount((Integer) statistics.get("receiptCount"));
        statisticsDto.setAverageSpendingPerDay((BigDecimal) statistics.get("averageSpendingPerDay"));
        statisticsDto.setDailySpending(convertDailySpending((Map<LocalDate, BigDecimal>) statistics.get("dailySpending")));
        statisticsDto.setSpendingByCategory(convertSpendingByCategory((Map<String, BigDecimal>) statistics.get("spendingByCategory")));

        return statisticsDto;
    }

    public static List<StatisticsDto> toStatisticDtos(List<Map<String, Object>> statisticsList){
        return statisticsList.stream().map(StatisticsConversor::toStatisticsDto).collect(Collectors.toList());
    }

    private static List<DailySpendingDto> convertDailySpending(Map<LocalDate, BigDecimal> dailySpendingMap) {
        List<DailySpendingDto> result = new ArrayList<>();
        dailySpendingMap.forEach((date, amount) -> {
            result.add(new DailySpendingDto(date.getDayOfMonth(), amount));
        });
        return result;
    }

    private static List<CategorySpendingDto> convertSpendingByCategory(Map<String, BigDecimal> spendingByCategory) {
        if (spendingByCategory == null || spendingByCategory.isEmpty()) {
            return new ArrayList<>();
        }

        return spendingByCategory.entrySet()
                .stream()
                .map(entry -> new CategorySpendingDto(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }
}
