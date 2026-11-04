# java-backend-template

Template di backend REST in **Java + Spring Boot**, pronto da copiare per nuovi progetti.
Implementa il [contratto API comune](../docs/api-contract.md) del repository:

- `GET /api/health` per lo stato del servizio;
- CRUD completo su `/api/items` con dati in memoria (3 item di esempio all'avvio);
- validazione con Bean Validation ed errori in formato **Problem Details** (RFC 9457);
- CORS, log e porta configurabili da variabili d'ambiente;
- documentazione OpenAPI con Swagger UI;
- test di integrazione HTTP (MockMvc) su tutti gli endpoint e unit test sul service;
- formatter (Spotless + palantir-java-format), copertura (JaCoCo), Dockerfile multi-stage.

## 1. Stack e versioni

Versioni esatte usate e verificate per questa guida (novembre 2026):

| Componente                     | Versione                         | Note                                                    |
|--------------------------------|----------------------------------|---------------------------------------------------------|
| Java (JDK)                     | **25** LTS (Temurin 25.0.5+8)    | LTS corrente; il progetto compila con `release 25`      |
| Spring Boot                    | **4.1.2**                        | ultima stabile su Maven Central                         |
| Spring Framework               | 7.0.10                           | gestita da Spring Boot                                  |
| Tomcat (embedded)              | 11.0.27                          | gestita da Spring Boot                                  |
| Jackson                        | 3.1.7                            | serializzazione JSON (package `tools.jackson`)          |
| Hibernate Validator            | 9.1.5.Final                      | implementazione di Jakarta Bean Validation              |
| springdoc-openapi              | 3.2.0                            | Swagger UI, compilata contro Spring Boot 4.1.2          |
| JUnit Jupiter                  | 6.0.3                            | evoluzione di JUnit 5 (stessa API `org.junit.jupiter`)  |
| Mockito / AssertJ              | 5.23.0 / 3.27.7                  | mock e asserzioni nei test                              |
| Maven (via Maven Wrapper)      | 3.9.16 (wrapper 3.3.4)           | non serve installare Maven: si usa `./mvnw`             |
| Spotless + palantir-java-format| 3.11.0 + 2.103.0                 | formatter                                               |
| JaCoCo                         | 0.8.16                           | copertura dei test                                      |
| Immagini Docker                | `eclipse-temurin:25.0.5_8-jdk-alpine` (build), `eclipse-temurin:25.0.5_8-jre-alpine` (runtime) | tag fissati |

Perché **palantir-java-format** e non google-java-format: è un fork di google-java-format (stesso motore,
deterministico, zero configurazione) ma con indentazione a 4 spazi e righe da 120 colonne, cioè lo stile a cui
è abituata la maggior parte degli sviluppatori Java/Spring e quello predefinito di IntelliJ IDEA.

## 2. Struttura delle cartelle

```text
java-backend-template/
├── .mvn/
│   ├── jvm.config                   # opzioni JVM per Maven (servono al formatter su JDK 25)
│   └── wrapper/maven-wrapper.properties  # versione di Maven scaricata da mvnw
├── mvnw, mvnw.cmd                   # Maven Wrapper (Linux/macOS e Windows)
├── pom.xml                          # dipendenze e plugin di build
├── Dockerfile, .dockerignore
├── .env.example                     # variabili d'ambiente di esempio (da copiare in .env)
└── src/
    ├── main/
    │   ├── java/com/example/javabackendtemplate/
    │   │   ├── Application.java     # punto di ingresso (main)
    │   │   ├── config/              # CORS, OpenAPI, Clock, proprietà "app.*", dati seed
    │   │   ├── controller/          # layer HTTP: rotte REST, validazione input, nessuna logica
    │   │   ├── service/             # logica di business (casi d'uso)
    │   │   ├── repository/          # accesso ai dati: interfaccia + implementazione in memoria
    │   │   ├── domain/              # modello di dominio (Item)
    │   │   ├── dto/                 # oggetti di input/output dell'API (record Java)
    │   │   └── exception/           # eccezioni applicative + GlobalExceptionHandler (Problem Details)
    │   └── resources/
    │       ├── application.yml      # configurazione comune (legge PORT, CORS_ORIGINS, LOG_LEVEL)
    │       ├── application-dev.yml  # profilo dev (default): log testuali
    │       └── application-prod.yml # profilo prod (Docker): log JSON strutturati
    └── test/java/com/example/javabackendtemplate/
        ├── controller/              # test di integrazione HTTP (MockMvc) su tutti gli endpoint
        ├── service/                 # unit test del service (senza Spring)
        └── exception/               # test del 500 generico (slice @WebMvcTest con mock)
```

Flusso di una richiesta: `controller` → `service` → `repository`. Il controller conosce solo DTO e service,
il service conosce il repository tramite **interfaccia**, il repository conosce solo il modello di dominio.

## 3. Prerequisiti e installazione dell'ambiente

Serve solo un **JDK 25**. Maven non va installato: il Maven Wrapper (`mvnw`) scarica da solo la versione
giusta (3.9.16) in `~/.m2/wrapper` al primo utilizzo. Docker serve solo per eseguire il container.

### JDK 25 (Eclipse Temurin)

Download ufficiale: <https://adoptium.net/temurin/releases/?version=25> (scegli JDK, il tuo sistema e
l'architettura). In alternativa usa un package manager:

| Sistema | Comando consigliato | Dove viene installato |
|---------|---------------------|-----------------------|
| Windows | `winget install EclipseAdoptium.Temurin.25.JDK` (oppure l'installer `.msi` dal sito, spuntando "Set JAVA_HOME") | `C:\Program Files\Eclipse Adoptium\jdk-25...` |
| macOS   | `brew install --cask temurin@25` | `/Library/Java/JavaVirtualMachines/temurin-25.jdk` |
| Linux (Debian/Ubuntu) | repository APT di Adoptium: <https://adoptium.net/installation/linux/> poi `sudo apt install temurin-25-jdk` | `/usr/lib/jvm/temurin-25-jdk-*` |
| Linux (Fedora/RHEL)   | repository RPM di Adoptium (stessa pagina) poi `sudo dnf install temurin-25-jdk` | `/usr/lib/jvm/temurin-25-jdk` |
| Tutti (version manager) | [SDKMAN!](https://sdkman.io/install) (macOS, Linux, WSL): `sdk install java 25.0.5-tem` | `~/.sdkman/candidates/java/` |

Se hai più JDK, imposta `JAVA_HOME` sul JDK 25 (l'installer di Windows e SDKMAN lo fanno da soli;
su macOS: `export JAVA_HOME=$(/usr/libexec/java_home -v 25)`).

Verifica:

```bash
java -version      # deve mostrare: openjdk version "25.0.x" ... LTS
./mvnw -v          # mostra Maven 3.9.16 e "Java version: 25..."  (Windows: mvnw.cmd -v)
```

### Docker (opzionale)

- Windows / macOS: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  (`winget install Docker.DockerDesktop` / `brew install --cask docker`).
- Linux: [Docker Engine](https://docs.docker.com/engine/install/) dal repository ufficiale per la tua distro.

Verifica: `docker --version` e `docker compose version`.

### Editor consigliati

- **IntelliJ IDEA** (Community va benissimo): apri la cartella, riconosce il `pom.xml` da solo. Plugin
  consigliato: *palantir-java-format* per formattare come Spotless.
- **VS Code** con l'estensione [Extension Pack for Java](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack)
  e [Spring Boot Extension Pack](https://marketplace.visualstudio.com/items?itemName=vmware.vscode-boot-dev-pack).

## 4. Installazione delle dipendenze

```bash
./mvnw dependency:go-offline     # facoltativo: scarica subito tutte le dipendenze in ~/.m2
```

Le dipendenze vengono comunque scaricate automaticamente al primo `./mvnw test` o `./mvnw spring-boot:run`.
Su **Windows** usa `mvnw.cmd` al posto di `./mvnw` (PowerShell: `.\mvnw.cmd`).

## 5. Comandi

| Scopo | Comando |
|-------|---------|
| Avvio in sviluppo (profilo `dev`) | `./mvnw spring-boot:run` |
| Test (unit + integrazione) | `./mvnw test` |
| Build completa: test + controllo formattazione + report copertura | `./mvnw verify` |
| Controllo formattazione | `./mvnw spotless:check` |
| Formattazione automatica | `./mvnw spotless:apply` |
| Copertura dei test | `./mvnw verify` poi apri `target/site/jacoco/index.html` |
| Build del jar (senza test) | `./mvnw -DskipTests package` → `target/java-backend-template-0.0.1-SNAPSHOT.jar` |
| Anteprima produzione | `SPRING_PROFILES_ACTIVE=prod java -jar target/java-backend-template-0.0.1-SNAPSHOT.jar` |
| Pulizia | `./mvnw clean` |

Dopo l'avvio: <http://localhost:8080/api/health> e Swagger UI su <http://localhost:8080/swagger-ui.html>.

## 6. Configurazione

Le variabili d'ambiente vengono lette in `src/main/resources/application.yml` con la sintassi `${VAR:default}`.
Per lo sviluppo copia `.env.example` in `.env`: Spring Boot lo carica da solo se avvii dalla cartella del
progetto. Le variabili d'ambiente reali hanno la precedenza sul file `.env`.

| Variabile | Significato | Default |
|-----------|-------------|---------|
| `PORT` | porta HTTP | `8080` |
| `CORS_ORIGINS` | origini consentite, separate da virgola | porte dev/docker di tutti i frontend del repository |
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error` | `info` |
| `SPRING_PROFILES_ACTIVE` | `dev` (log testuali) o `prod` (log JSON ECS) | `dev` in locale, `prod` nel container |

Altre proprietà Spring si possono sovrascrivere allo stesso modo con la "relaxed binding": ad esempio
`springdoc.swagger-ui.enabled` diventa `SPRINGDOC_SWAGGER_UI_ENABLED=false`.

## 7. Docker

L'immagine è multi-stage: compila con il JDK e `./mvnw`, poi copia il jar (estratto in layer) su un JRE Alpine,
gira con l'utente non-root `app` e ha un `HEALTHCHECK` su `/actuator/health`.

```bash
docker build -t java-backend-template .
docker run --rm -p 8080:8080 java-backend-template
# con variabili:
docker run --rm -p 8080:8080 -e LOG_LEVEL=debug -e CORS_ORIGINS=http://localhost:5173 java-backend-template
```

Porta: **8080** sia in locale sia nel container. Nel `docker-compose.yml` della root il servizio si chiama
`java-backend-template` ed è pubblicato sulla porta host **8085**:

```bash
# dalla root del repository
docker compose up --build java-backend-template
curl http://localhost:8085/api/health
```

Stato dell'healthcheck: `docker ps` (colonna STATUS, `healthy`) oppure
`docker inspect --format '{{.State.Health.Status}}' <container>`.

## 8. API disponibili

| Metodo | Rotta | Successo | Errori |
|--------|-------|----------|--------|
| `GET` | `/api/health` | `200` `{ status, service, timestamp }` | - |
| `GET` | `/api/items` | `200` array di item ordinati per `createdAt` | - |
| `GET` | `/api/items/{id}` | `200` item | `404` |
| `POST` | `/api/items` | `201` item + header `Location` | `400` |
| `PUT` | `/api/items/{id}` | `200` item aggiornato | `400`, `404` |
| `DELETE` | `/api/items/{id}` | `204` senza corpo | `404` |

Endpoint di servizio (non fanno parte del contratto):

- Swagger UI: <http://localhost:8080/swagger-ui.html>
- Specifica OpenAPI JSON: <http://localhost:8080/v3/api-docs>
- Health interno Actuator: <http://localhost:8080/actuator/health> (anche `/liveness` e `/readiness`)

Esempi:

```bash
curl http://localhost:8080/api/items
curl -i -X POST http://localhost:8080/api/items \
  -H 'Content-Type: application/json' \
  -d '{"name":"Lamp","description":"LED desk lamp","price":19.99}'
```

Errore di validazione (`400`, `Content-Type: application/problem+json`):

```json
{
  "type": "about:blank",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "instance": "/api/items",
  "errors": { "name": ["name is required"], "price": ["price must be greater than or equal to 0"] }
}
```

## 9. Come aggiungere una nuova risorsa (passo passo)

Esempio: una risorsa `Category` su `/api/categories`. Copia i file di `Item` e rinomina.

1. **Dominio** – `domain/Category.java`: un `record` con i campi persistiti (`id`, `name`, `createdAt`, ...).
2. **DTO** – `dto/CategoryInput.java` con le annotazioni di validazione (`@NotBlank`, `@Size`, ...) e un
   messaggio in inglese per ogni vincolo; `dto/CategoryResponse.java` con il metodo `from(Category)`.
3. **Repository** – `repository/CategoryRepository.java` (interfaccia) e
   `repository/InMemoryCategoryRepository.java` annotata `@Repository`, con una `ConcurrentHashMap`.
4. **Service** – `service/CategoryService.java` annotato `@Service`: riceve repository e `Clock` nel
   costruttore, genera id/timestamp e lancia `new ResourceNotFoundException("Category", id)` se non trova.
5. **Controller** – `controller/CategoryController.java` con `@RestController` e
   `@RequestMapping("/api/categories")`; usa `@Valid @RequestBody` per gli input. Non serve toccare il
   `GlobalExceptionHandler`: 400, 404 e 500 sono già gestiti per tutti i controller. Il CORS vale già per
   tutto `/api/**` e la rotta compare da sola in Swagger UI.
6. **Test** – copia `ItemServiceTest` (unit) e `ItemControllerTest` (integrazione HTTP) adattandoli.
7. Esegui `./mvnw spotless:apply verify`.

Per passare a un **database vero**: aggiungi `spring-boot-starter-data-jpa` e il driver, crea
un'implementazione di `ItemRepository` basata su JPA (o fai estendere l'interfaccia a `JpaRepository`),
rimuovi `InMemoryItemRepository` e `SeedDataInitializer` (i dati iniziali vanno in una migrazione Flyway/Liquibase)
e aggiungi `@Transactional` ai metodi del service che modificano dati.

## 10. Problemi comuni

| Problema | Soluzione |
|----------|-----------|
| `release version 25 not supported` / `invalid target release: 25` | Maven usa un JDK più vecchio: controlla `./mvnw -v` e imposta `JAVA_HOME` sul JDK 25. |
| `./mvnw: Permission denied` | `chmod +x mvnw` (succede se il file è stato copiato senza permessi). |
| `/usr/bin/env: 'sh\r': No such file or directory` | `mvnw` ha line ending Windows (CRLF): il file `.gitattributes` lo evita; se serve, riconvertilo con `dos2unix mvnw`. |
| `Port 8080 was already in use` | Ferma l'altro processo oppure avvia con `PORT=8081 ./mvnw spring-boot:run`. |
| Il frontend riceve errori CORS | Aggiungi l'origine del frontend (schema + host + porta) a `CORS_ORIGINS`. |
| `spotless:check` fallisce in `verify` | Esegui `./mvnw spotless:apply` e ricontrolla le modifiche. |
| Download dipendenze fallisce dietro un proxy aziendale | Configura il proxy in `~/.m2/settings.xml` (sezione `<proxies>`) e, se il proxy fa ispezione TLS, importa il suo certificato nel truststore del JDK con `keytool -importcert -cacerts`. Nel `docker build` serve lo stesso certificato nello stage di build. |
| Il container resta `unhealthy` | Guarda `docker logs <container>`; se cambi `PORT`, l'healthcheck la segue in automatico. |

## 11. Comandi utili extra

```bash
./mvnw test -Dtest=ItemServiceTest                 # esegue una sola classe di test
./mvnw test -Dtest='ItemControllerTest#delete*'     # solo alcuni metodi
./mvnw dependency:tree                              # albero delle dipendenze
./mvnw versions:display-dependency-updates          # dipendenze con versioni più nuove disponibili
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod  # avvio locale con il profilo prod
LOG_LEVEL=debug ./mvnw spring-boot:run              # log dettagliati
./mvnw wrapper:wrapper -Dmaven=3.9.16               # aggiorna/rigenera il Maven Wrapper
docker build --no-cache -t java-backend-template .  # rebuild senza cache
```
