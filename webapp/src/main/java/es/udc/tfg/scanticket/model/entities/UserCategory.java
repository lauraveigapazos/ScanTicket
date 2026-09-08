package es.udc.tfg.scanticket.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "UserCategories")
public class UserCategory {

    private Long id;
    private User user;
    private String productName;
    private String category;

    public UserCategory() {
    }

    public UserCategory(User user, String productName, String category) {
        this.user = user;
        this.productName = productName;
        this.category = category;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToOne(optional = false)
    @JoinColumn(name = "userId", nullable = false)
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
