package es.udc.tfg.scanticket.rest.controllers;

import es.udc.tfg.scanticket.model.services.StatisticsService;
import es.udc.tfg.scanticket.rest.dtos.StatisticsConversor;
import es.udc.tfg.scanticket.rest.dtos.StatisticsDto;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping
    public ResponseEntity<StatisticsDto> getStatistics(@RequestAttribute Long userId,
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate){

        Map<String, Object> stats = statisticsService.getStatistics(userId, startDate, endDate);
        return ResponseEntity.ok(StatisticsConversor.toStatisticsDto(stats));
    }
}
