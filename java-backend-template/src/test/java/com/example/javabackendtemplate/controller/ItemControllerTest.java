/*
 * Test di integrazione HTTP del CRUD /api/items: casi di successo ed errori (400, 404) nel formato
 * Problem Details del contratto API.
 */
package com.example.javabackendtemplate.controller;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/**
 * {@code @DirtiesContext} ricrea il contesto Spring (e quindi il repository in memoria con i 3 item seed) prima di ogni
 * test: ogni test parte dagli stessi dati, indipendentemente dall'ordine di esecuzione.
 */
@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class ItemControllerTest {

    private static final String MISSING_ID = "00000000-0000-4000-8000-000000000000";
    private static final String VALID_BODY = """
            {"name": "  Desk lamp  ", "description": "LED lamp", "price": 19.99}
            """;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listReturnsSeedItemsOrderedByCreatedAt() throws Exception {
        mockMvc.perform(get("/api/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[*].name", contains("Keyboard", "Mouse", "Monitor")))
                .andExpect(jsonPath("$[2].description").isEmpty());
    }

    @Test
    void createReturns201WithLocationAndTrimmedName() throws Exception {
        String id = createItem(VALID_BODY)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Desk lamp"))
                .andExpect(jsonPath("$.price").value(19.99))
                .andExpect(jsonPath("$.createdAt").isString())
                .andExpect(jsonPath("$.updatedAt").isString())
                .andReturn()
                .getResponse()
                .getContentAsString()
                .transform(json -> JsonPath.read(json, "$.id"));

        mockMvc.perform(get("/api/items")).andExpect(jsonPath("$", hasSize(4)));
        mockMvc.perform(get("/api/items/{id}", id)).andExpect(status().isOk());
    }

    @Test
    void createSetsLocationHeader() throws Exception {
        createItem(VALID_BODY)
                .andExpect(header().string(
                                HttpHeaders.LOCATION, matchesPattern("http://localhost/api/items/[0-9a-f-]{36}")));
    }

    @Test
    void getByIdReturnsItem() throws Exception {
        String id = firstSeedId();
        mockMvc.perform(get("/api/items/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.name").value("Keyboard"));
    }

    @Test
    void getByIdReturns404ProblemDetails() throws Exception {
        mockMvc.perform(get("/api/items/{id}", MISSING_ID))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value("about:blank"))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.title").value("Resource not found"))
                .andExpect(jsonPath("$.errors").doesNotExist());
    }

    @Test
    void createWithInvalidBodyReturns400WithFieldErrors() throws Exception {
        createItem("""
                        {"name": "   ", "description": "%s", "price": -1}
                        """.formatted("x".repeat(501)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.type").value("about:blank"))
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail").value("One or more fields are invalid."))
                .andExpect(jsonPath("$.errors.name", contains("name is required")))
                .andExpect(jsonPath("$.errors.description", contains("description must be at most 500 characters")))
                .andExpect(jsonPath("$.errors.price", contains("price must be greater than or equal to 0")));
    }

    @Test
    void createWithMissingFieldsReturns400() throws Exception {
        createItem("{}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name", contains("name is required")))
                .andExpect(jsonPath("$.errors.price", contains("price is required")));
    }

    @Test
    void createWithTooLongNameReturns400() throws Exception {
        createItem("""
                        {"name": "%s", "price": 1}
                        """.formatted("n".repeat(101)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name", contains("name must be at most 100 characters")));
    }

    @Test
    void createWithMalformedJsonReturns400ProblemDetails() throws Exception {
        createItem("{not json")
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void updateReturnsUpdatedItem() throws Exception {
        String id = firstSeedId();
        mockMvc.perform(put("/api/items/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Keyboard v2", "description": null, "price": 99}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.name").value("Keyboard v2"))
                .andExpect(jsonPath("$.description").isEmpty())
                .andExpect(jsonPath("$.price").value(99));
    }

    @Test
    void updateWithInvalidBodyReturns400() throws Exception {
        mockMvc.perform(put("/api/items/{id}", firstSeedId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"\", \"price\": 1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name", contains("name is required")));
    }

    @Test
    void updateMissingItemReturns404() throws Exception {
        mockMvc.perform(put("/api/items/{id}", MISSING_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void deleteReturns204AndRemovesItem() throws Exception {
        String id = firstSeedId();
        mockMvc.perform(delete("/api/items/{id}", id))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));
        mockMvc.perform(get("/api/items/{id}", id)).andExpect(status().isNotFound());
    }

    @Test
    void deleteMissingItemReturns404() throws Exception {
        mockMvc.perform(delete("/api/items/{id}", MISSING_ID))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void unknownRouteReturns404ProblemDetails() throws Exception {
        mockMvc.perform(get("/api/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void corsPreflightAllowsConfiguredOrigin() throws Exception {
        mockMvc.perform(options("/api/items")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));
    }

    @Test
    void corsPreflightRejectsUnknownOrigin() throws Exception {
        mockMvc.perform(options("/api/items")
                        .header(HttpHeaders.ORIGIN, "http://evil.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(status().isForbidden());
    }

    private ResultActions createItem(String json) throws Exception {
        return mockMvc.perform(
                post("/api/items").contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private String firstSeedId() throws Exception {
        String json =
                mockMvc.perform(get("/api/items")).andReturn().getResponse().getContentAsString();
        return JsonPath.read(json, "$[0].id");
    }
}
