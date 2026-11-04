/*
 * Costruisce la risposta di GET /api/health (stato "ok", nome servizio, timestamp UTC).
 */
package com.example.javabackendtemplate.service;

import com.example.javabackendtemplate.dto.HealthResponse;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Health "applicativo" pubblico del contratto API. Il controllo operativo interno (usato da Docker) è invece l'endpoint
 * Actuator {@code /actuator/health}.
 */
@Service
public class HealthService {

    private final String serviceName;
    private final Clock clock;

    /** {@code @Value} inietta una proprietà di configurazione (qui da application.yml). */
    public HealthService(@Value("${spring.application.name}") String serviceName, Clock clock) {
        this.serviceName = serviceName;
        this.clock = clock;
    }

    public HealthResponse getHealth() {
        return new HealthResponse("ok", serviceName, Instant.now(clock).truncatedTo(ChronoUnit.SECONDS));
    }
}
