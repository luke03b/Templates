/*
 * Eccezione di dominio "risorsa non trovata": il GlobalExceptionHandler la traduce in un 404 Problem Details.
 */
package com.example.javabackendtemplate.exception;

/**
 * Riutilizzabile per qualsiasi risorsa: {@code new ResourceNotFoundException("Item", id)}. È una RuntimeException
 * (unchecked), quindi non va dichiarata con {@code throws} nelle firme dei metodi.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, String id) {
        super("%s with id '%s' was not found.".formatted(resourceName, id));
    }
}
