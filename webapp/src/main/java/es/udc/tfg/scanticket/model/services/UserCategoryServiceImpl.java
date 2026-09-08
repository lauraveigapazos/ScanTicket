package es.udc.tfg.scanticket.model.services;

import es.udc.tfg.scanticket.model.common.exceptions.InstanceNotFoundException;
import es.udc.tfg.scanticket.model.entities.User;
import es.udc.tfg.scanticket.model.entities.UserCategory;
import es.udc.tfg.scanticket.model.entities.UserCategoryDao;
import org.springframework.stereotype.Service;

import java.text.Normalizer;

@Service
public class UserCategoryServiceImpl implements UserCategoryService{

    private final UserCategoryDao userCategoryDao;
    private final UserService userService;


    public UserCategoryServiceImpl(UserCategoryDao userCategoryDao, UserService userService){
        this.userCategoryDao = userCategoryDao;
        this.userService = userService;
    }
    @Override
    public UserCategory findByUserIdAndProductName(Long userId, String productName) {

        String normalizedProductName = normalizeProductName(productName);

        return userCategoryDao.findByUserIdAndProductName(userId, normalizedProductName).orElse(null);
    }

    @Override
    public UserCategory saveCategory(Long userId, String productName, String category) throws InstanceNotFoundException {

        User user = userService.findUserById(userId);

        if (user == null){
            throw new InstanceNotFoundException("project.entities.user", userId);
        }

        String normalizedProductName = normalizeProductName(productName);

        UserCategory userCategory = userCategoryDao.findByUserIdAndProductName(userId, normalizedProductName)
                .orElse(new UserCategory());

        userCategory.setUser(user);
        userCategory.setProductName(normalizedProductName);
        userCategory.setCategory(category);

        userCategoryDao.save(userCategory);

        return userCategory;
    }

    @Override
    public String normalizeProductName(String productName) {

        if (productName == null) {
            return null;
        }

        return Normalizer.normalize(productName, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim()
                .replaceAll("\\s+", " ")
                .toLowerCase();
    }
}
