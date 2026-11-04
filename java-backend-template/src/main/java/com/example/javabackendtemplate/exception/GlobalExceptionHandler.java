/*
 * Gestore centralizzato degli errori: trasforma le eccezioni in risposte Problem Details (RFC 9457)
 * con Content-Type application/problem+json, nel formato definito dal contratto API.
 */
package com.example.javabackendtemplate.exception;

import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.jspecify.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * {@code @RestControllerAdvice} applica i metodi {@code @ExceptionHandler} a tutti i controller.
 *
 * <p>Estendere {@link ResponseEntityExceptionHandler} fa sì che anche gli errori standard di Spring MVC (JSON
 * malformato, 404 su rotta inesistente, 405 metodo non consentito, 415 media type, ...) escano già come
 * {@link ProblemDetail}; qui personalizziamo solo i casi del contratto.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Il contratto API richiede sempre il campo "type"; "about:blank" = nessuna pagina di documentazione. */
    private static final URI ABOUT_BLANK = URI.create("about:blank");

    /** 400: errori di Bean Validation sul body ({@code @Valid}) mappati come {@code errors: campo -> messaggi}. */
    @Override
    protected @Nullable ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        Map<String, List<String>> errors = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.computeIfAbsent(fieldError.getField(), field -> new ArrayList<>())
                    .add(fieldError.getDefaultMessage());
        }
        // Errori "globali" (vincoli sull'intero oggetto, es. validatori custom di classe): chiave = nome oggetto.
        for (ObjectError globalError : ex.getBindingResult().getGlobalErrors()) {
            errors.computeIfAbsent(globalError.getObjectName(), key -> new ArrayList<>())
                    .add(globalError.getDefaultMessage());
        }

        ProblemDetail problem = problem(HttpStatus.BAD_REQUEST, "Validation failed", "One or more fields are invalid.");
        problem.setProperty("errors", errors);
        return handleExceptionInternal(ex, problem, headers, HttpStatus.BAD_REQUEST, request);
    }

    /** 404: risorsa applicativa non trovata (nessun campo {@code errors}). */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        return problem(HttpStatus.NOT_FOUND, "Resource not found", ex.getMessage());
    }

    /**
     * 500: qualsiasi eccezione non prevista. Il client riceve un messaggio generico (mai stack trace o dettagli
     * interni); l'errore completo finisce nei log.
     */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "An unexpected error occurred.");
    }

    /**
     * Ultimo passaggio di tutte le risposte create dalla classe base (errori standard di Spring MVC): aggiunge
     * {@code type} se manca, così ogni errore ha la stessa forma.
     */
    @Override
    protected ResponseEntity<Object> createResponseEntity(
            @Nullable Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        if (body instanceof ProblemDetail problem && problem.getType() == null) {
            problem.setType(ABOUT_BLANK);
        }
        return super.createResponseEntity(body, headers, statusCode, request);
    }

    private static ProblemDetail problem(HttpStatus status, String title, String detail) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setType(ABOUT_BLANK);
        problem.setTitle(title);
        return problem;
    }
}
