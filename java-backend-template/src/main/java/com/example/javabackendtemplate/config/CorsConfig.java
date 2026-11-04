/*
 * Configurazione CORS: quali origini (frontend su altre porte/domini) possono chiamare le API dal browser.
 */
package com.example.javabackendtemplate.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Un {@code WebMvcConfigurer} permette di personalizzare Spring MVC senza sostituirne la configurazione automatica. Le
 * origini non sono hardcoded: arrivano da {@link AppProperties} (variabile CORS_ORIGINS).
 */
@Configuration
@EnableConfigurationProperties(AppProperties.class)
public class CorsConfig implements WebMvcConfigurer {

    private final AppProperties properties;

    public CorsConfig(AppProperties properties) {
        this.properties = properties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(properties.cors().allowedOrigins().toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                // Il frontend deve poter leggere l'header Location restituito dalla POST.
                .exposedHeaders("Location")
                .maxAge(3600);
    }
}
