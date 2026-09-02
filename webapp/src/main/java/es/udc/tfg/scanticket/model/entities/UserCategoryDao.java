package es.udc.tfg.scanticket.model.entities;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserCategoryDao extends JpaRepository<UserCategory, Long> {

    Optional<UserCategory> findByUserIdAndProductName(Long userId, String productName);
}
