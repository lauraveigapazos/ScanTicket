package es.udc.tfg.scanticket.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReceiptDao extends JpaRepository<Receipt, Long> {

    List<Receipt> findByUserIdOrderByDateDesc(Long userId);

    Optional<Receipt> findByIdAndUserId(Long receiptId, Long userId);

    List<Receipt> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);


}
