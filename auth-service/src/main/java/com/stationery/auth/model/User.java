package com.stationery.auth.model;
// package declaration

//import tools for database mapping, data validation and timestamps.
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

//this class represents a table in db with the name "users"
@Entity
@Table(name = "users")
public class User {

    //mark this variable as primary key of table
    @Id
    //tell mysql auto increment the id value when a new record is inserted
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //tell mysql that this column cant be null and must be unique.
    @Column(nullable = false, unique = true)
    //validate that this field is not blank when creating or updating a user
    @NotBlank(message = "Username is required")
    private String username;

    //@Email - automatically checks if string has an @ symbol and .com domain.
    @Column(nullable = false, unique = true)
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    //stores user's password (not hashed).
    @Column(nullable = false)
    @NotBlank(message = "Password is required")
    private String password;

    //by default java saves enums as integer in db. we want to save it as string for better readability. 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    //empty constructor is required by JPA to create instances of this class when fetching data from the database.
    public User() {}

    //full constructor, used to create a user with all data filled at once.
    public User(Long id, String username, String email, String password, Role role, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    //getters and setters for all fields, used to access and modify the private variables of this class.
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    //a database trigger, whenever a new user is created, it automatically sets the createdAt and updatedAt fields to the current date and time.
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    //this method is called before updating a user, it automatically updates the updatedAt field to the current date and time.
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public static UserBuilder builder() { return new UserBuilder(); }

    public static class UserBuilder {
        private Long id;
        private String username;
        private String email;
        private String password;
        private Role role;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder username(String username) { this.username = username; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public User build() {
            return new User(id, username, email, password, role, createdAt, updatedAt);
        }
    }
}
