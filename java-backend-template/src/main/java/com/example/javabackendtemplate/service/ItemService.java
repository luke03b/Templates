/*
 * Logica di business degli Item: crea id e timestamp, applica le regole e usa il repository.
 */
package com.example.javabackendtemplate.service;

import com.example.javabackendtemplate.domain.Item;
import com.example.javabackendtemplate.dto.ItemInput;
import com.example.javabackendtemplate.dto.ItemResponse;
import com.example.javabackendtemplate.exception.ResourceNotFoundException;
import com.example.javabackendtemplate.repository.ItemRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * {@code @Service} registra la classe come bean. Le dipendenze arrivano dal costruttore ("constructor injection"):
 * Spring le passa automaticamente, e nei unit test si possono passare a mano senza Spring.
 *
 * <p>Con un database vero, i metodi che modificano dati andrebbero annotati con {@code @Transactional}.
 */
@Service
public class ItemService {

    private static final Logger log = LoggerFactory.getLogger(ItemService.class);
    private static final String RESOURCE_NAME = "Item";

    private final ItemRepository repository;
    private final Clock clock;

    public ItemService(ItemRepository repository, Clock clock) {
        this.repository = repository;
        this.clock = clock;
    }

    public List<ItemResponse> findAll() {
        return repository.findAll().stream().map(ItemResponse::from).toList();
    }

    public ItemResponse findById(String id) {
        return ItemResponse.from(getExisting(id));
    }

    public ItemResponse create(ItemInput input) {
        Instant now = now();
        Item item = new Item(UUID.randomUUID().toString(), input.name(), input.description(), input.price(), now, now);
        repository.save(item);
        log.info("Item created: id={}", item.id());
        return ItemResponse.from(item);
    }

    public ItemResponse update(String id, ItemInput input) {
        Item existing = getExisting(id);
        // createdAt resta quello originale, updatedAt diventa "adesso".
        Item updated =
                new Item(existing.id(), input.name(), input.description(), input.price(), existing.createdAt(), now());
        repository.save(updated);
        log.info("Item updated: id={}", id);
        return ItemResponse.from(updated);
    }

    public void delete(String id) {
        if (!repository.deleteById(id)) {
            throw new ResourceNotFoundException(RESOURCE_NAME, id);
        }
        log.info("Item deleted: id={}", id);
    }

    private Item getExisting(String id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException(RESOURCE_NAME, id));
    }

    /** Millisecondi come precisione massima: stringhe ISO 8601 compatte e facili da leggere per i frontend. */
    private Instant now() {
        return Instant.now(clock).truncatedTo(ChronoUnit.MILLIS);
    }
}
