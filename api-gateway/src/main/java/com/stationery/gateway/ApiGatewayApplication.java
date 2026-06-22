package com.stationery.gateway;
//package declaration

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * API Gateway Application.
 * <p>
 * Serves as the single entry point for the Stationery Management System.
 * Routes incoming requests to appropriate microservices, validates JWT
 * tokens, and propagates user identity headers to downstream services.
 * </p>
 */
@SpringBootApplication
// register this service with the discovery server (Eureka)
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
