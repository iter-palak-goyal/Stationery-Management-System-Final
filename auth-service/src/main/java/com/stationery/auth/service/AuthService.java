package com.stationery.auth.service;

import com.stationery.auth.dto.AuthResponse;
import com.stationery.auth.dto.LoginRequest;
import com.stationery.auth.dto.RegisterRequest;
import com.stationery.auth.model.Role;
import com.stationery.auth.model.User;
import com.stationery.auth.repository.UserRepository;
import com.stationery.auth.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Service handling user registration, login, and token validation logic.
 */
//tell the sprig that this class contains the core business logic.
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    //talk to mySQL db.
    private final UserRepository userRepository;
    //To mathematically scramble passwords
    private final PasswordEncoder passwordEncoder;
    //To mathematically generate the JWT strings.
    private final JwtUtil jwtUtil;
    //The core engine of Spring Security that handles verifying if a password is correct.
    private final AuthenticationManager authenticationManager;

    @Value("${services.request-service.url:http://localhost:8083}")
    private String requestServiceUrl;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Registers a new user in the system.
     * Validates that the username and email are not already taken,
     * encodes the password, saves the user, and returns a JWT token.
     *
     * @param request the registration request DTO
     * @return an AuthResponse containing the JWT token and user details
     * @throws RuntimeException if the username or email already exists
     */

    //registerRequest cotains the java object which was converted from json object in dto.
    public AuthResponse register(RegisterRequest request) {
        logger.info("Attempting to register user: {}", request.getUsername());

        
        if (userRepository.existsByUsername(request.getUsername())) {
            logger.warn("Registration failed - username already exists: {}", request.getUsername());
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            logger.warn("Registration failed - email already exists: {}", request.getEmail());
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        //string -> enum
        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid role provided: {}, defaulting to STUDENT", request.getRole());
            role = Role.STUDENT;
        }

        //Uses the Builder pattern to create the actual User object that will be saved.
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                //this takes raw password ad turn it into a scrambled hash using bcrypt.
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        //saves newly created user to mysql db.
        userRepository.save(user);
        logger.info("User registered successfully: {}", user.getUsername());

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        // Send Audit Log
        sendAuditLog(user.getUsername(), user.getRole().name(), "REGISTER", 
                "User registered with email: " + user.getEmail(), 
                "New user registration");

        //packages the token into an AuthResponse box and returns it back to the Controller!
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .message("User registered successfully")
                .build();
    }

    /**
     * Authenticates a user and returns a JWT token.
     *
     * @param request the login request DTO
     * @return an AuthResponse containing the JWT token and user details
     */
    public AuthResponse login(LoginRequest request) {
        logger.info("Attempting login for email: {}", request.getEmail());

        //You pass the  email and raw password into the authenticationManager. Spring Security takes over, finds the user in the database, runs the complex BCrypt math to check if the passwords match.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        logger.info("User authenticated successfully with email: {}", request.getEmail());

        //If the code reaches this line, it means the password was 100% correct. It fetches the user from the database (so we can know what their role is). It generates a fresh JWT token and returns it to the Controller.
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found: " + request.getEmail()));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        // Send Audit Log
        sendAuditLog(user.getUsername(), user.getRole().name(), "LOGIN", 
                "User logged in with email: " + request.getEmail(), 
                "Successful authentication");

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .message("Login successful")
                .build();
    }

    /**
     * Validates a JWT token.
     *
     * @param token the JWT token to validate
     * @return true if the token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    /**
     * Retrieves the email address of a user by their username.
     *
     * @param username the username to look up
     * @return the user's email address
     * @throws RuntimeException if the user is not found
     */
    public String getUserEmail(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return user.getEmail();
    }

    /**
     * Helper to send audit logs to request-service asynchronously.
     */

    //An Audit Log is a historical security trail. It tracks "Who did what, when, and why." In a secure application, you want a record every time someone logs in, registers, fails to log in, or gets their password changed.
    private void sendAuditLog(String username, String role, String action, String details, String reason) {
        try {
            //Because the auth-service doesn't store audit logs itself, it needs to make an HTTP request over the network. RestTemplate is a Spring Boot tool used to make HTTP calls
            RestTemplate restTemplate = new RestTemplate();
            java.util.Map<String, String> payload = java.util.Map.of(
                    "username", username,
                    "role", role,
                    "action", action,
                    "details", details,
                    "reason", reason
            );
            restTemplate.postForEntity(requestServiceUrl + "/api/requests/audit-logs", payload, Void.class);
        } catch (Exception e) {
            logger.error("Failed to send audit log to request-service: {}", e.getMessage());
        }
    }
}
