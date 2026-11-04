/*
 * Implementazione in memoria di ItemRepository: i dati si azzerano al riavvio.
 */
package com.example.javabackendtemplate.repository;

import com.example.javabackendtemplate.domain.Item;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

/**
 * {@code @Repository} registra la classe come bean Spring (singleton): una sola istanza condivisa da tutte le richieste
 * HTTP, che arrivano su thread diversi. Per questo usiamo {@link ConcurrentHashMap}, sicura in accesso concorrente,
 * invece di una HashMap.
 */
@Repository
public class InMemoryItemRepository implements ItemRepository {

    private static final Comparator<Item> BY_CREATION =
            Comparator.comparing(Item::createdAt).thenComparing(Item::id);

    private final Map<String, Item> items = new ConcurrentHashMap<>();

    @Override
    public List<Item> findAll() {
        return items.values().stream().sorted(BY_CREATION).toList();
    }

    @Override
    public Optional<Item> findById(String id) {
        return Optional.ofNullable(items.get(id));
    }

    @Override
    public Item save(Item item) {
        items.put(item.id(), item);
        return item;
    }

    @Override
    public boolean deleteById(String id) {
        return items.remove(id) != null;
    }
}
