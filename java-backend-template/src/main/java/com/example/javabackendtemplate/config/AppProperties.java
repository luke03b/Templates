/*
 * Proprietà di configurazione specifiche dell'applicazione (prefisso "app" in application.yml).
 * I valori arrivano dalle variabili d'ambiente tramite i placeholder ${...} di application.yml.
 */
package com.example.javabackendtemplate.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Record immutabile popolato da Spring all'avvio ("type-safe configuration").
 *
 * @param cors impostazioni CORS
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Cors cors) {

    /**
     * @param allowedOrigins origini consentite; Spring converte da sola la stringa separata da virgole di CORS_ORIGINS
     *     in una lista
     */
    public record Cors(List<String> allowedOrigins) {}
}
