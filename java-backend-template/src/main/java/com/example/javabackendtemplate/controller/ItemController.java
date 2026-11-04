/*
 * Endpoint REST CRUD /api/items. Layer sottile: riceve la request, valida il body e delega al service.
 */
package com.example.javabackendtemplate.controller;

import com.example.javabackendtemplate.dto.ItemInput;
import com.example.javabackendtemplate.dto.ItemResponse;
import com.example.javabackendtemplate.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * Le annotazioni {@code @GetMapping}, {@code @PostMapping}, ... associano un metodo HTTP + percorso a un metodo Java.
 * {@code @PathVariable} legge un pezzo dell'URL, {@code @RequestBody} converte il JSON nel DTO e {@code @Valid} ne
 * attiva la validazione (errore -> 400 gestito da GlobalExceptionHandler).
 */
@RestController
@RequestMapping("/api/items")
@Tag(name = "Items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    @Operation(summary = "List all items ordered by createdAt")
    public List<ItemResponse> findAll() {
        return itemService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an item by id")
    public ItemResponse findById(@PathVariable String id) {
        return itemService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Create an item")
    public ResponseEntity<ItemResponse> create(@Valid @RequestBody ItemInput input) {
        ItemResponse created = itemService.create(input);
        // Header Location: URL assoluto della nuova risorsa, es. http://localhost:8080/api/items/{id}
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Replace an item")
    public ItemResponse update(@PathVariable String id, @Valid @RequestBody ItemInput input) {
        return itemService.update(id, input);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an item")
    public void delete(@PathVariable String id) {
        itemService.delete(id);
    }
}
