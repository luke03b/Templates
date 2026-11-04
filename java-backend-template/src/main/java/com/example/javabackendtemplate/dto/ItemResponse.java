/*
 * DTO di output: la rappresentazione JSON di un Item restituita dall'API.
 */
package com.example.javabackendtemplate.dto;

import com.example.javabackendtemplate.domain.Item;
import java.math.BigDecimal;
import java.time.Instant;

/** Jackson serializza i record usando i nomi dei componenti (camelCase) e gli Instant come stringhe ISO 8601. */
public record ItemResponse(
        String id, String name, String description, BigDecimal price, Instant createdAt, Instant updatedAt) {

    /** Factory method: converte il modello di dominio nel DTO pubblico. */
    public static ItemResponse from(Item item) {
        return new ItemResponse(
                item.id(), item.name(), item.description(), item.price(), item.createdAt(), item.updatedAt());
    }
}
