package es.udc.tfg.scanticket.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReceiptItemDao extends JpaRepository<ReceiptItem, Long> {
}
