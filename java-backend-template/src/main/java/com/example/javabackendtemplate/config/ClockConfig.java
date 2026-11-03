/*
 * Espone un java.time.Clock come bean, così il codice non chiama Instant.now() direttamente
 * e nei test si può usare un orologio fisso o controllabile.
 */
package com.example.javabackendtemplate.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ClockConfig {

    /** Orologio di sistema in UTC: tutte le date dell'API sono in UTC (ISO 8601 con suffisso Z). */
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
