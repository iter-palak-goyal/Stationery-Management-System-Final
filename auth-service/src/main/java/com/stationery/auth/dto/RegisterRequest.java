package com.stationery.auth.dto;

//import spring validation rules. if frontend sends bad data, spring will reject it before it reaches the controller.
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    //ensure the user didnt just send a blank credentials.
    @NotBlank(message = "Username is required")
    private String username;

    //ensures string actually looks like an email address.
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    //ensure that the password has a minimum length of 6.
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    //if frontend does not send a role, default to STUDENT.
    private String role = "STUDENT";

    public RegisterRequest() {}

    public RegisterRequest(String username, String email, String password, String role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public static RegisterRequestBuilder builder() { return new RegisterRequestBuilder(); }

    public static class RegisterRequestBuilder {
        private String username;
        private String email;
        private String password;
        private String role = "STUDENT";

        public RegisterRequestBuilder username(String username) { this.username = username; return this; }
        public RegisterRequestBuilder email(String email) { this.email = email; return this; }
        public RegisterRequestBuilder password(String password) { this.password = password; return this; }
        public RegisterRequestBuilder role(String role) { this.role = role; return this; }

        public RegisterRequest build() {
            return new RegisterRequest(username, email, password, role);
        }
    }
}
