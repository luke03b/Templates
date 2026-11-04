/*
 * Endpoint GET /api/health: indica che il processo è vivo (risponde sempre 200).
 */
package com.example.javabackendtemplate.controller;

import com.example.javabackendtemplate.dto.HealthResponse;
import com.example.javabackendtemplate.service.HealthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** {@code @RestController}: i valori restituiti dai metodi vengono serializzati in JSON nel body. */
@RestController
@RequestMapping("/api")
@Tag(name = "Health")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping("/health")
    @Operation(summary = "Service status")
    public HealthResponse health() {
        return healthService.getHealth();
    }
}
