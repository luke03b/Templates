/*
 * Metadati della documentazione OpenAPI generata da springdoc (titolo, versione, descrizione).
 * Swagger UI: /swagger-ui.html - specifica JSON: /v3/api-docs
 */
package com.example.javabackendtemplate.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Una classe {@code @Configuration} contiene metodi {@code @Bean}: ogni metodo crea un oggetto che Spring registra nel
 * container e inietta dove serve. Qui springdoc usa il bean {@link OpenAPI} come base della specifica, a cui aggiunge
 * da solo gli endpoint letti dai controller.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openApi(@Value("${spring.application.name}") String applicationName) {
        return new OpenAPI()
                .info(new Info()
                        .title(applicationName)
                        .version("v1")
                        .description("Example REST API: health check and in-memory CRUD on items."));
    }
}
