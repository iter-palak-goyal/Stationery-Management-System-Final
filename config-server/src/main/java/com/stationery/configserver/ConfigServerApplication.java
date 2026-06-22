package com.stationery.configserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

/**
 * Spring Cloud Config Server Application.
 * <p>
 * Provides centralized configuration management for all microservices
 * in the Stationery Management System. Uses native profile to serve
 * configuration files from the classpath.
 * </p>
 */

// this is the main entry point to start the app.
@SpringBootApplication

//spring cloud instruct springboot to download all config-server libraries, activate config-server endpoits and listen for other microservice calling it.
@EnableConfigServer

//declaring the class. 
// public is access modifier
// class is java keyword to declare a class blueprint
// ConfigServerApplication is the name of the class
public class ConfigServerApplication {
    //main method
    // standard starting point of java. JVM search this line to begin execution.
    //static is JVM doesn't need to create an object to run this method.
    public static void main(String[] args) {
        //SpringApplication is a class that provides a way to bootstrap a Spring application.
        //it triggers that start spring boot engine. 
        // .run is static method which actually starts the boot-up sequence.
        //passing out main class and command line arg. 
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
