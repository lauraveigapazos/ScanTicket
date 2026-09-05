package es.udc.tfg.scanticket.model.services;

import es.udc.tfg.scanticket.model.common.exceptions.InstanceNotFoundException;
import es.udc.tfg.scanticket.model.entities.UserCategory;

public interface UserCategoryService {

    UserCategory findByUserIdAndProductName(Long userId, String productName);

    UserCategory saveCategory(Long userId, String productName, String category) throws InstanceNotFoundException;

    String normalizeProductName(String productName);
}
