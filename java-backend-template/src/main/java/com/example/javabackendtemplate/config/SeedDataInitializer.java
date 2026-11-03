/*
 * Popola il repository in memoria con 3 item di esempio all'avvio, così i frontend mostrano subito dei dati.
 */
package com.example.javabackendtemplate.config;

import com.example.javabackendtemplate.domain.Item;
import com.example.javabackendtemplate.repository.ItemRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Un {@link ApplicationRunner} viene eseguito da Spring una volta, a contesto avviato. Con un database vero questo
 * compito passerebbe a una migrazione (Flyway/Liquibase) e questa classe andrebbe rimossa.
 */
@Component
public class SeedDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedDataInitializer.class);

    private final ItemRepository repository;
    private final Clock clock;

    public SeedDataInitializer(ItemRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!repository.findAll().isEmpty()) {
            return;
        }
        // createdAt distanziati di un secondo: l'ordinamento per createdAt è stabile e prevedibile.
        Instant base = Instant.now(clock).truncatedTo(ChronoUnit.SECONDS).minusSeconds(3);
        seed(base.plusSeconds(0), "Keyboard", "Mechanical keyboard with brown switches", "89.90");
        seed(base.plusSeconds(1), "Mouse", "Wireless ergonomic mouse", "39.50");
        seed(base.plusSeconds(2), "Monitor", null, "249.00");
        log.info("Seeded {} example items", repository.findAll().size());
    }

    private void seed(Instant createdAt, String name, String description, String price) {
        repository.save(
                new Item(UUID.randomUUID().toString(), name, description, new BigDecimal(price), createdAt, createdAt));
    }
}
