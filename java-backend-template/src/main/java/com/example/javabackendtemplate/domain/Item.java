/*
 * Modello di dominio "Item": ciò che il repository memorizza.
 * È separato dai DTO dell'API, così il formato di persistenza può cambiare senza rompere il contratto HTTP.
 */
package com.example.javabackendtemplate.domain;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Un {@code record} è una classe immutabile con costruttore, getter ({@code name()}, non {@code getName()}),
 * {@code equals}, {@code hashCode} e {@code toString} generati dal compilatore.
 *
 * <p>{@link BigDecimal} per il prezzo evita gli errori di arrotondamento di double sulle cifre decimali.
 */
public record Item(
        String id, String name, String description, BigDecimal price, Instant createdAt, Instant updatedAt) {}
