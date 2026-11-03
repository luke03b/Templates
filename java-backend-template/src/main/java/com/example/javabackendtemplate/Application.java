/*
 * Punto di ingresso dell'applicazione Spring Boot.
 * Avvia il container di dependency injection, il server web embedded (Tomcat) e la configurazione.
 */
package com.example.javabackendtemplate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * {@code @SpringBootApplication} attiva tre cose: configurazione automatica (auto-configuration), scansione dei
 * componenti (@Component, @Service, @RestController, ...) in questo package e nei sotto-package, e la possibilità di
 * dichiarare @Bean qui.
 */
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
