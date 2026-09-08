package es.udc.tfg.scanticket.model.services;

import es.udc.tfg.scanticket.model.common.exceptions.InstanceNotFoundException;
import es.udc.tfg.scanticket.model.entities.User;
import es.udc.tfg.scanticket.model.entities.UserCategory;
import es.udc.tfg.scanticket.model.entities.UserCategoryDao;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;


import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserCategoryServiceTest {

    private UserCategoryService userCategoryService;

    @MockBean
    private UserCategoryDao userCategoryDao;

    @MockBean
    private UserService userService;

    private User testUser;

    @Before
    public void setUp(){

        userCategoryService = new UserCategoryServiceImpl(userCategoryDao, userService);

        testUser = new User("testUser", "password", "Test", "User", "test@test.com");
        testUser.setId(1L);
    }

    @Test
    public void testSaveCategory_NewCategory() throws InstanceNotFoundException {

        when(userService.findUserById(1L)).thenReturn(testUser);

        when(userCategoryDao.findByUserIdAndProductName(1L, "Tofu"))
                .thenReturn(Optional.empty());

        UserCategory savedCategory = new UserCategory(testUser, "Tofu", "Proteínas");

        when(userCategoryDao.save(any(UserCategory.class)))
                .thenReturn(savedCategory);

        UserCategory result = userCategoryService.saveCategory(1L, "Tofu", "Proteínas"
        );

        assertNotNull(result);
        assertEquals(testUser, result.getUser());
        assertEquals("tofu", result.getProductName());
        assertEquals("Proteínas", result.getCategory());

        verify(userService).findUserById(1L);
        verify(userCategoryDao).findByUserIdAndProductName(1L, "tofu");
        verify(userCategoryDao).save(any(UserCategory.class));
    }

    @Test
    public void testSaveCategory_ExistingCategory() throws InstanceNotFoundException {

        when(userService.findUserById(1L))
                .thenReturn(testUser);

        UserCategory existingCategory = new UserCategory(testUser, "tofu", "Proteínas");

        when(userCategoryDao.findByUserIdAndProductName(1L, "tofu"))
                .thenReturn(Optional.of(existingCategory));

        when(userCategoryDao.save(any(UserCategory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        UserCategory result = userCategoryService.saveCategory(1L, "Tofu", "Vegetales");

        assertNotNull(result);
        assertEquals(testUser, result.getUser());
        assertEquals("tofu", result.getProductName());
        assertEquals("Vegetales", result.getCategory());

        verify(userCategoryDao).findByUserIdAndProductName(1L, "tofu");

        verify(userCategoryDao).save(existingCategory);
    }

    @Test
    public void testFindByUserIdAndProductName_Found() {

        UserCategory userCategory = new UserCategory(testUser, "tofu", "Proteínas");

        when(userCategoryDao.findByUserIdAndProductName(1L, "tofu"))
                .thenReturn(Optional.of(userCategory));

        UserCategory result = userCategoryService.findByUserIdAndProductName(1L, "Tofu");

        assertNotNull(result);
        assertEquals("tofu", result.getProductName());
        assertEquals("Proteínas", result.getCategory());

        verify(userCategoryDao).findByUserIdAndProductName(1L, "tofu");
    }

    @Test
    public void testFindByUserIdAndProductName_NotFound() {

        when(userCategoryDao.findByUserIdAndProductName(1L, "tofu"))
                .thenReturn(Optional.empty());

        UserCategory result = userCategoryService.findByUserIdAndProductName(1L, "Tofu");

        assertNull(result);

        verify(userCategoryDao).findByUserIdAndProductName(1L, "tofu");
    }
}
