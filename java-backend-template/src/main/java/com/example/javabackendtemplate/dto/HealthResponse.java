/*
 * DTO di output di GET /api/health.
 */
package com.example.javabackendtemplate.dto;

import java.time.Instant;

/**
 * @param status sempre "ok" se il processo risponde
 * @param service nome del servizio (spring.application.name)
 * @param timestamp istante della risposta in UTC
 */
public record HealthResponse(String status, String service, Instant timestamp) {}
