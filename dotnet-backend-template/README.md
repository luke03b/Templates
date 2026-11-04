# dotnet-backend-template

Template backend **ASP.NET Core 10 (LTS)** con Minimal API, architettura a layer
(Api, Application, Contracts, Infrastructure), CRUD in memoria della risorsa `items`,
validazione, Problem Details (RFC 9457), OpenAPI + UI Scalar, CORS configurabile,
logging strutturato, test xUnit e Docker.

Implementa alla lettera il contratto comune [`docs/api-contract.md`](../docs/api-contract.md):
qualsiasi frontend del repository funziona con questo backend senza modifiche.

## 1. Stack e versioni

Versioni esatte usate e verificate per questa guida (novembre 2026):

| Componente | Versione | Note |
|---|---|---|
| .NET SDK | 10.0.403 | fissato in `global.json` (`rollForward: latestFeature`) |
| .NET / ASP.NET Core runtime | 10.0.14 | .NET 10 = LTS, supportato fino a novembre 2028 |
| C# | 14 | `LangVersion=latest` con SDK 10 |
| Microsoft.AspNetCore.OpenApi | 10.0.14 | generazione nativa del documento OpenAPI 3.1 |
| Scalar.AspNetCore | 2.18.7 | UI interattiva della documentazione su `/docs` |
| DotNetEnv | 3.2.0 | caricamento del file `.env` in sviluppo |
| Microsoft.Extensions.*.Abstractions | 10.0.14 | DI e logging nei layer Application/Infrastructure |
| xunit.v3 | 4.0.2 | framework di test (su Microsoft.Testing.Platform) |
| Microsoft.AspNetCore.Mvc.Testing | 10.0.14 | `WebApplicationFactory` per i test di integrazione |
| Microsoft.Extensions.TimeProvider.Testing | 10.11.0 | `FakeTimeProvider` (orologio finto nei test) |
| Microsoft.Testing.Extensions.CodeCoverage | 18.12.0 | coverage (`dotnet test --coverage`) |
| Immagine build | `mcr.microsoft.com/dotnet/sdk:10.0.403` | |
| Immagine runtime | `mcr.microsoft.com/dotnet/aspnet:10.0.14` | utente non-root `app` |

Le versioni dei pacchetti NuGet sono tutte in un unico file: `Directory.Packages.props`
(Central Package Management).

### Scelte architetturali

- **Minimal API con endpoint group** invece dei Controller. Per i nuovi progetti Microsoft
  indica le Minimal API come approccio consigliato: meno codice di contorno, prestazioni migliori,
  compatibilita con Native AOT e, da .NET 10, validazione built-in (`AddValidation`).
  Con `MapGroup` + metodi di estensione (`MapItemEndpoints`) ogni risorsa ha il suo file,
  proprio come un controller. `TypedResults` e `Results<A, B>` rendono gli esiti verificati dal
  compilatore e documentati automaticamente in OpenAPI. I Controller restano supportati: sono
  utili soprattutto se servono filtri MVC, model binding avanzato o si migra codice esistente.
- **Layer Infrastructure** separato: contiene il repository in memoria. L'interfaccia
  `IItemRepository` vive in Application (dependency inversion), quindi per passare a un database
  vero (es. EF Core) basta aggiungere una nuova implementazione in Infrastructure e cambiare una
  riga di registrazione, senza toccare service ed endpoint.
- **Validazione built-in di .NET 10** con attributi DataAnnotations sui DTO (nessuna libreria
  esterna). Gli errori vengono riportati nel formato `errors` del contratto con chiavi camelCase.
- **Solo HTTP** (nessun `UseHttpsRedirection`): in container e in produzione il TLS e gestito dal
  reverse proxy / ingress. Il template non richiede il certificato di sviluppo HTTPS.
- **Formato soluzione `.slnx`**: il nuovo formato XML (default da .NET 10), molto piu leggibile
  del vecchio `.sln` e facile da unire in caso di conflitti git.

## 2. Struttura delle cartelle

```text
dotnet-backend-template/
├── DotnetBackendTemplate.slnx        # soluzione (formato XML .slnx)
├── Directory.Build.props             # impostazioni comuni: net10.0, Nullable, TreatWarningsAsErrors, analyzer
├── Directory.Packages.props          # versioni centralizzate dei pacchetti NuGet
├── global.json                       # versione dell'SDK e runner dei test (Microsoft.Testing.Platform)
├── .editorconfig                     # regole di stile usate da IDE, build e `dotnet format`
├── .env.example                      # variabili d'ambiente di esempio (copiare in .env)
├── Dockerfile / .dockerignore
├── src/
│   ├── DotnetBackendTemplate.Api/            # layer HTTP (punto di ingresso)
│   │   ├── Program.cs                        # composizione: servizi, middleware, endpoint
│   │   ├── Endpoints/                        # HealthEndpoints, ItemEndpoints (una classe per risorsa)
│   │   ├── Configuration/                    # lettura PORT/CORS_ORIGINS/LOG_LEVEL, logging, CORS, OpenAPI
│   │   ├── ErrorHandling/                    # GlobalExceptionHandler (IExceptionHandler)
│   │   ├── HealthProbe.cs                    # sonda usata dall'HEALTHCHECK Docker
│   │   ├── appsettings*.json                 # configurazione di default
│   │   └── Properties/launchSettings.json    # profilo di avvio locale (porta 5080)
│   ├── DotnetBackendTemplate.Application/    # logica di business
│   │   ├── Health/HealthService.cs
│   │   ├── Items/                            # Item (dominio), IItemRepository, IItemService, ItemService
│   │   └── DependencyInjection.cs            # AddApplication()
│   ├── DotnetBackendTemplate.Contracts/      # DTO pubblici (JSON) + attributi di validazione
│   │   ├── Health/HealthResponse.cs
│   │   ├── Items/ItemRequest.cs, ItemResponse.cs
│   │   └── Validation/TrimmedLengthAttribute.cs
│   └── DotnetBackendTemplate.Infrastructure/ # accesso ai dati
│       ├── Items/InMemoryItemRepository.cs, ItemSeedData.cs
│       └── DependencyInjection.cs            # AddInfrastructure()
└── tests/DotnetBackendTemplate.Tests/
    ├── Unit/                                 # ItemService, repository, regole di validazione
    └── Integration/                          # test HTTP con WebApplicationFactory (ApiFactory)
```

Dipendenze tra progetti (le frecce puntano verso chi viene usato):

```text
Api ──► Application ──► Contracts
 │  └─► Infrastructure ──► Application
 └────► Contracts
```

## 3. Prerequisiti e installazione dell'ambiente

Serve solo il **.NET 10 SDK** (include runtime, compilatore, `dotnet format` e il tool di test).
Download ufficiale: <https://dotnet.microsoft.com/download/dotnet/10.0>.
Per Docker serve [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS)
o Docker Engine (Linux).

### Windows

- **winget** (consigliato): `winget install Microsoft.DotNet.SDK.10`
- oppure l'installer `.exe` x64/Arm64 dalla pagina di download.
- Percorso di installazione: `C:\Program Files\dotnet\` (aggiunto automaticamente al `PATH`).

### macOS

- Installer `.pkg` (Arm64 per Apple Silicon, x64 per Intel) dalla pagina di download.
- oppure lo script ufficiale:
  `curl -sSL https://dot.net/v1/dotnet-install.sh | bash -s -- --channel 10.0`
  (installa in `~/.dotnet`; aggiungi `export DOTNET_ROOT=$HOME/.dotnet` e
  `export PATH=$PATH:$DOTNET_ROOT:$DOTNET_ROOT/tools` al file `~/.zshrc`).
- Con il `.pkg` il percorso e `/usr/local/share/dotnet/`.
- Homebrew (`brew install --cask dotnet-sdk`) installa l'ultima versione disponibile, che puo
  essere piu recente della 10: va bene grazie a `rollForward`, ma per restare sulla LTS preferisci
  il `.pkg` o lo script con `--channel 10.0`.

### Linux

- **Ubuntu**: `sudo apt-get update && sudo apt-get install -y dotnet-sdk-10.0`
  (se il pacchetto non e disponibile nella tua release: `sudo add-apt-repository ppa:dotnet/backports`).
- **Fedora / RHEL**: `sudo dnf install dotnet-sdk-10.0`
- **Qualsiasi distribuzione** (senza root), script ufficiale:
  ```bash
  curl -sSL https://dot.net/v1/dotnet-install.sh | bash -s -- --channel 10.0 --install-dir ~/.dotnet
  export DOTNET_ROOT=$HOME/.dotnet
  export PATH=$DOTNET_ROOT:$DOTNET_ROOT/tools:$PATH   # aggiungili a ~/.bashrc
  ```
- Percorsi tipici: `/usr/lib/dotnet` (pacchetti della distro) oppure `~/.dotnet` (script).

### Verifica

```bash
dotnet --version     # 10.0.xxx
dotnet --list-sdks
dotnet --info        # mostra anche il percorso di installazione
```

Opzionale: `export DOTNET_CLI_TELEMETRY_OPTOUT=1` per disattivare la telemetria della CLI.

### Editor consigliati

- **Visual Studio Code** + estensione **C# Dev Kit** (`ms-dotnettools.csdevkit`) ed **EditorConfig**
  (proposte automaticamente da `.vscode/extensions.json`).
- **Visual Studio 2026** (Windows) con il workload "Sviluppo ASP.NET e Web".
- **JetBrains Rider** 2025.3 o successivo.

## 4. Installazione delle dipendenze

Dalla cartella `dotnet-backend-template/`:

```bash
cp .env.example .env        # opzionale: configurazione locale
dotnet restore              # scarica i pacchetti NuGet (fatto anche da build/test/run)
```

## 5. Comandi

| Scopo | Comando |
|---|---|
| Avvio in sviluppo (porta 5080) | `dotnet run --project src/DotnetBackendTemplate.Api` |
| Avvio con hot reload | `dotnet watch --project src/DotnetBackendTemplate.Api` |
| Build | `dotnet build` |
| Test (unit + integrazione) | `dotnet test` |
| Test di una sola classe | `dotnet test --filter-class "DotnetBackendTemplate.Tests.Unit.ItemServiceTests"` |
| Coverage (Cobertura XML in `TestResults/`) | `dotnet test --coverage --coverage-output-format cobertura --coverage-output coverage.cobertura.xml` |
| Verifica formattazione/stile (CI) | `dotnet format --verify-no-changes` |
| Correzione automatica formattazione | `dotnet format` |
| Build di produzione | `dotnet publish src/DotnetBackendTemplate.Api -c Release -o publish` |
| Anteprima produzione | `ASPNETCORE_ENVIRONMENT=Production dotnet publish/DotnetBackendTemplate.Api.dll` |

Dopo l'avvio:

- API: <http://localhost:5080/api/health>
- Documentazione interattiva (Scalar): <http://localhost:5080/docs> (anche `/` reindirizza qui)
- Documento OpenAPI JSON: <http://localhost:5080/openapi/v1.json>

Note:

- La build tratta **ogni warning come errore** (`TreatWarningsAsErrors`, analyzer `latest-recommended`,
  regole di stile di `.editorconfig`). Se la build fallisce per lo stile, esegui `dotnet format`.
- `dotnet test` usa **Microsoft.Testing.Platform** (abilitato in `global.json`), il runner moderno
  richiesto da xUnit v3/v4 con l'SDK 10. Le opzioni si passano direttamente
  (`dotnet test --filter-class ...`), senza `--`.

## 6. Configurazione

Le impostazioni arrivano da `IConfiguration`, che unisce (in ordine di priorita crescente):
`appsettings.json` → `appsettings.{Ambiente}.json` → file `.env` → variabili d'ambiente → argomenti
da riga di comando. Il file `.env` viene letto da DotNetEnv senza sovrascrivere le variabili gia
impostate.

| Variabile | Significato | Default |
|---|---|---|
| `PORT` | porta HTTP | `5080` in locale, `8080` nel container |
| `CORS_ORIGINS` | origini consentite separate da virgola (`*` = tutte) | porte dev/docker dei frontend (vedi contratto) |
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error` | `info` |
| `ASPNETCORE_ENVIRONMENT` | `Development`, `Production`, ... | `Development` con `dotnet run`, `Production` nel container |

- **Logging**: in `Development` log leggibili su una riga; negli altri ambienti JSON strutturato
  (una riga = un oggetto JSON con `Timestamp`, `LogLevel`, `Category`, `Message`, `State`), pronto
  per Loki/ELK/Datadog. Le regole per categoria in `appsettings.json`
  (es. `"Microsoft.AspNetCore": "Warning"`) restano piu specifiche di `LOG_LEVEL`.
- **PORT** ha la precedenza su `ASPNETCORE_URLS` e su `applicationUrl` di `launchSettings.json`.
- Configurazione strutturata aggiuntiva: aggiungila in `appsettings.json` e sovrascrivila con
  variabili d'ambiente usando `__` come separatore (es. `Logging__LogLevel__Default=Debug`).

## 7. Docker

```bash
docker build -t dotnet-backend-template .
docker run --rm -p 5080:8080 dotnet-backend-template
# con variabili:
docker run --rm -p 5080:8080 -e LOG_LEVEL=debug -e CORS_ORIGINS=http://localhost:5173 dotnet-backend-template
```

- Porta interna del container: **8080** (`PORT=8080` nel Dockerfile).
- Immagine finale basata su `aspnet:10.0.14`, eseguita con l'utente non-root `app` (UID 1654).
- `HEALTHCHECK`: l'immagine aspnet non contiene `curl`/`wget`, quindi la sonda e l'app stessa
  (`dotnet DotnetBackendTemplate.Api.dll --healthcheck`) che chiama `GET /api/health` ed esce con
  0/1. Stato: `docker inspect --format '{{.State.Health.Status}}' <container>`.
- Con il `docker-compose.yml` della root il servizio si chiama `dotnet-backend-template` ed e
  esposto sulla porta host **8087**:
  ```bash
  docker compose up --build dotnet-backend-template   # dalla root del repository
  curl http://localhost:8087/api/health
  ```
  I frontend lo raggiungono con `API_UPSTREAM=http://dotnet-backend-template:8080`.
- Immagine ancora piu piccola e senza shell: puoi usare la variante
  `mcr.microsoft.com/dotnet/aspnet:10.0.14-noble-chiseled` (gia non-root); l'HEALTHCHECK funziona
  uguale perche non usa la shell.

## 8. API disponibili

| Metodo | Rotta | Successo | Errori |
|---|---|---|---|
| `GET` | `/api/health` | `200` `{ status, service, timestamp }` | - |
| `GET` | `/api/items` | `200` array di `Item` ordinati per `createdAt` | - |
| `GET` | `/api/items/{id}` | `200` `Item` | `404` |
| `POST` | `/api/items` | `201` `Item` + header `Location` | `400` |
| `PUT` | `/api/items/{id}` | `200` `Item` aggiornato | `400`, `404` |
| `DELETE` | `/api/items/{id}` | `204` | `404` |

All'avvio ci sono 3 item di esempio. Tutti gli errori sono `application/problem+json`:

```json
{
  "type": "about:blank",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "errors": { "name": ["name is required"], "price": ["price must be greater than or equal to 0"] },
  "traceId": "00-...-00"
}
```

- `404`: item inesistente, id non UUID o rotta inesistente (senza `errors`).
- `400`: validazione, JSON malformato (`errors.body`) o campo con tipo sbagliato (`errors.price`).
- `500`: messaggio generico `An unexpected error occurred.`; l'eccezione completa e solo nei log.
- `traceId` e un campo in piu (ammesso da RFC 9457) utile per ritrovare la richiesta nei log.

Esempi rapidi:

```bash
curl http://localhost:5080/api/items
curl -i -X POST http://localhost:5080/api/items -H "Content-Type: application/json" \
  -d '{"name":"Desk lamp","description":"LED","price":19.99}'
```

## 9. Come aggiungere una nuova risorsa (esempio: `products`)

1. **Contracts**: crea `src/DotnetBackendTemplate.Contracts/Products/ProductRequest.cs` (con gli
   attributi di validazione, messaggi in inglese) e `ProductResponse.cs`, copiando `ItemRequest`
   e `ItemResponse`.
2. **Application – dominio e porta**: crea `Products/Product.cs` (record immutabile) e
   `Products/IProductRepository.cs` copiando `Item.cs` e `IItemRepository.cs`.
3. **Application – service**: crea `IProductService` e `ProductService` (logica, normalizzazione,
   mapping verso il DTO) e registralo in `Application/DependencyInjection.cs`:
   ```csharp
   services.AddScoped<IProductService, ProductService>();
   ```
4. **Infrastructure**: crea `Products/InMemoryProductRepository.cs` (copia di
   `InMemoryItemRepository`) e registralo in `Infrastructure/DependencyInjection.cs`:
   ```csharp
   services.AddSingleton<IProductRepository, InMemoryProductRepository>();
   ```
5. **Api**: crea `Endpoints/ProductEndpoints.cs` copiando `ItemEndpoints.cs` (cambia
   `MapGroup("/products")`, i tag e i nomi delle rotte) e aggiungilo in `Program.cs`:
   ```csharp
   api.MapProductEndpoints();
   ```
   La validazione del body e automatica: basta che il parametro dell'handler sia `ProductRequest`.
6. **Test**: copia `Unit/ItemServiceTests.cs` e `Integration/ItemEndpointsTests.cs` adattandoli.
7. Verifica: `dotnet format && dotnet build && dotnet test`, poi controlla la nuova risorsa su `/docs`.

Per passare a un database vero: aggiungi EF Core in Infrastructure (`DbContext` + repository che
implementa `IItemRepository`), registralo come `Scoped` al posto di quello in memoria e usa le
migrazioni (`dotnet ef migrations add ...`). Service ed endpoint non cambiano.

## 10. Problemi comuni

| Problema | Soluzione |
|---|---|
| `A compatible .NET SDK was not found` | Installa l'SDK 10 (vedi sezione 3). `global.json` richiede `10.0.100` o superiore. |
| `Testing with VSTest target is no longer supported...` | Esegui i test dalla cartella del template: `global.json` abilita Microsoft.Testing.Platform. |
| `address already in use` sulla 5080 | Cambia porta: `PORT=5081 dotnet run --project src/DotnetBackendTemplate.Api`, oppure chiudi il processo che la occupa. |
| Build fallita per un warning (IDE/CA...) | E voluto (`TreatWarningsAsErrors`). Correggi il codice o esegui `dotnet format`. |
| Errore CORS nel browser | Aggiungi l'origine del frontend a `CORS_ORIGINS` (schema+host+porta esatti, senza `/` finale). |
| `.env` ignorato | Il file deve chiamarsi `.env` nella cartella del template (o in una cartella superiore); le variabili gia impostate nella shell vincono. |
| `docker build` fallisce su `dotnet restore` con `UntrustedRoot`/SSL | Sei dietro un proxy aziendale che ispeziona il TLS: aggiungi il certificato della CA nello stage `build` (`COPY` in `/usr/local/share/ca-certificates/` + `update-ca-certificates` oppure `ENV SSL_CERT_FILE=...`). |
| Container `unhealthy` | `docker logs <container>`; verifica che `PORT` coincida con la porta su cui l'app ascolta. |
| `/docs` risponde 302 | Normale: Scalar reindirizza a `/docs/`. |

## 11. Comandi utili extra

```bash
dotnet list package --outdated          # pacchetti NuGet aggiornabili
dotnet sln DotnetBackendTemplate.slnx list
dotnet new classlib -o src/DotnetBackendTemplate.Xyz && dotnet sln add src/DotnetBackendTemplate.Xyz
dotnet dev-certs https --trust          # solo se vuoi abilitare HTTPS in locale
dotnet run --project tests/DotnetBackendTemplate.Tests   # esegue i test come eseguibile (xUnit v3)
docker compose logs -f dotnet-backend-template
```
