/*
 * DTO di input per POST/PUT /api/items, con le regole di validazione del contratto API.
 */
package com.example.javabackendtemplate.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Le annotazioni jakarta.validation (Bean Validation) vengono verificate quando il controller riceve il body con
 * {@code @Valid}; gli errori diventano un 400 Problem Details (vedi GlobalExceptionHandler).
 *
 * <p>Il costruttore "compatto" del record (senza parametri espliciti) viene eseguito prima della validazione: qui
 * facciamo il trim, così " abc " viene validato e salvato come "abc".
 */
public record ItemInput(
        @Schema(example = "Keyboard", minLength = 1, maxLength = 100)
        @NotBlank(message = "name is required")
        @Size(max = 100, message = "name must be at most 100 characters")
        String name,

        @Schema(example = "Mechanical keyboard", maxLength = 500, nullable = true)
        @Size(max = 500, message = "description must be at most 500 characters")
        String description,

        @Schema(example = "89.90", minimum = "0")
        @NotNull(message = "price is required")
        @DecimalMin(value = "0", message = "price must be greater than or equal to 0")
        BigDecimal price) {

    public ItemInput {
        name = name == null ? null : name.strip();
    }
}
