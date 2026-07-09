# Java Backend Template

Template Spring Boot minimale con un endpoint di health e struttura layered di base.

## Cosa installare in locale

- Java 17 o superiore.
- Maven 3.9+ oppure il wrapper se lo aggiungi al template.

Verifica rapida dell'ambiente:

```bash
java -version
mvn -version
```

## Avvio in locale

1. Esegui i test.

```bash
mvn test
```

2. Avvia l'applicazione.

```bash
mvn spring-boot:run
```

3. Apri `http://localhost:8080/api/health`.

## Avvio con Docker

1. Costruisci l'immagine.

```bash
docker build -t java-template .
```

2. Avvia il container.

```bash
docker run --rm -p 8080:8080 java-template
```

3. Apri `http://localhost:8080/api/health`.

## Struttura

- `src/main/java/com/example/javatemplate/Application.java` - bootstrap dell'app
- `src/main/java/com/example/javatemplate/api/HealthController.java` - layer API
- `src/main/java/com/example/javatemplate/application/HealthService.java` - layer applicativo
- `src/main/java/com/example/javatemplate/api/dto/HealthResponse.java` - risposta del contratto API
- `src/test/java/com/example/javatemplate/api/HealthControllerTest.java` - test dell'endpoint

## Avvio

1. Installa Java 17 o superiore.
2. Avvia l'app con `./mvnw spring-boot:run` oppure `mvn spring-boot:run`.

## Endpoint

- `GET /api/health` restituisce lo stato corrente dell'applicazione.
