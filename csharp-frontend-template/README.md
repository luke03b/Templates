# csharp-frontend-template

Template **frontend** in C# con **Blazor WebAssembly standalone** su **.NET 10 (LTS)**.
L'app C# viene compilata in assembly .NET che girano **nel browser** grazie al runtime
WebAssembly: il risultato di `dotnet publish` è una cartella di file statici
(`publish/wwwroot`), servita in Docker da **nginx**, che fa anche da reverse proxy di
`/api/` verso il backend.

Contiene:

- **Home** con indicatore di stato del backend (`GET /api/health`, pallino verde "Online" / rosso "Offline");
- **Components**: vetrina dei componenti riutilizzabili con anteprima dal vivo e codice da copiare;
- **Items**: CRUD completo su `/api/items` (lista con QuickGrid, crea, modifica, elimina) con
  loading, errori e **errori di validazione Problem Details mostrati sotto ai campi**;
- **404** per qualsiasi URL sconosciuto;
- layout responsive mobile-first, design token in un unico file CSS, niente Bootstrap;
- client API unico e tipizzato, test xUnit v3 + bUnit, `dotnet format` pulito, Docker + nginx.

Funziona con **qualsiasi backend** del repository che rispetta `docs/api-contract.md`.

## 1. Stack e versioni

Versioni usate e verificate per questa guida (novembre 2026):

| Componente | Versione | Note |
|---|---|---|
| .NET SDK | 10.0.403 (Docker) · minimo 10.0.100 | `global.json` con `rollForward: latestFeature` |
| Runtime / ASP.NET Core Components | 10.0.14 | .NET 10 è la LTS corrente (supporto fino a novembre 2028) |
| C# | 14 (`LangVersion` latest) | Nullable e TreatWarningsAsErrors attivi |
| Microsoft.AspNetCore.Components.WebAssembly | 10.0.14 | host Blazor WebAssembly |
| Microsoft.AspNetCore.Components.WebAssembly.DevServer | 10.0.14 | solo sviluppo (`dotnet run`/`watch`) |
| Microsoft.AspNetCore.Components.QuickGrid | 10.0.14 | griglia ufficiale Microsoft |
| xunit.v3 | 4.0.2 | framework di test (su Microsoft.Testing.Platform) |
| bunit | 2.13.3 | test dei componenti Blazor senza browser |
| Microsoft.Extensions.TimeProvider.Testing | 10.11.0 | `FakeTimeProvider` per i timer dei toast |
| Microsoft.Testing.Extensions.CodeCoverage | 18.12.0 | coverage (Cobertura) |
| Immagine build | `mcr.microsoft.com/dotnet/sdk:10.0.403` | |
| Immagine runtime | `nginx:1.30.6-alpine` | ramo stable di nginx |

Le versioni NuGet sono tutte in **un solo file**: `Directory.Packages.props`
(Central Package Management).

**Perché `.slnx`?** Dal .NET SDK 9.0.200 esiste il nuovo formato di soluzione XML
`.slnx` e da .NET 10 `dotnet new sln` lo crea come **default**: è leggibile, senza GUID,
facile da unire in git ed è supportato da Visual Studio 2022 17.13+/2026, Rider e C# Dev Kit.

**Perché non serve il workload `wasm-tools`?** Una build/publish standard di Blazor
WebAssembly funziona con il solo SDK. `wasm-tools` serve solo per AOT o per il relink del
runtime nativo (`RunAOTCompilation`, `WasmBuildNative`): il publish lo suggerisce con un
messaggio informativo, che si può ignorare.

## 2. Struttura delle cartelle

```text
csharp-frontend-template/
├── CSharpFrontendTemplate.slnx        # soluzione (formato XML .slnx)
├── global.json                        # versione minima SDK + runner dei test (MTP)
├── Directory.Build.props              # impostazioni comuni: net10.0, Nullable, warning = errori
├── Directory.Packages.props           # versioni NuGet centralizzate
├── .editorconfig                      # regole di stile usate da IDE e `dotnet format`
├── Dockerfile                         # build con SDK .NET -> runtime nginx
├── nginx/default.conf.template        # SPA fallback, proxy /api/, gzip, cache
├── src/CSharpFrontendTemplate/
│   ├── Program.cs                     # bootstrap: componenti radice, config, DI
│   ├── App.razor                      # Router (+ NotFoundPage)
│   ├── _Imports.razor                 # @using comuni a tutti i .razor
│   ├── Configuration/ApiOptions.cs    # calcolo dell'URL base del backend
│   ├── Models/                        # DTO: Item, ItemInput (DataAnnotations), HealthResponse, ProblemDetails
│   ├── Services/                      # IApiClient/ApiClient (HTTP), ApiException, ToastService (stato)
│   ├── Layout/                        # MainLayout + NavMenu responsive
│   ├── Pages/                         # Home, Components (showcase), Items (CRUD), NotFound
│   ├── Components/
│   │   ├── Ui/                        # componenti riutilizzabili e presentazionali
│   │   ├── Items/ItemForm.razor       # form dell'item (feature component)
│   │   └── Showcase/                  # CodeExample, modello e snippet della vetrina
│   ├── Properties/launchSettings.json # porta di sviluppo 5200
│   └── wwwroot/
│       ├── index.html                 # pagina host della SPA
│       ├── appsettings.json           # "ApiBaseUrl": "" (stessa origine)
│       ├── appsettings.Development.json # "ApiBaseUrl": "http://localhost:3000"
│       └── css/tokens.css, css/app.css  # design token + stili
└── tests/CSharpFrontendTemplate.Tests/
    ├── TestUtilities/                 # FakeHttpMessageHandler, FakeApiClient, UiTestContext
    ├── Services/                      # test ApiClient, ApiOptions, ToastService, validazione
    ├── Components/                    # test bUnit dei componenti (anche in sintassi .razor)
    └── Pages/                         # test bUnit di Home, Items, NavMenu, NotFound, Components
```

Componenti in `Components/Ui`: `AppButton`, `Card`, `Alert`, `Badge`, `Spinner`,
`StatusIndicator`, `Modal`, `Tabs`/`TabPanel`, `ToastHost` (+ `ToastService`), `FormField`
(etichetta + input + hint + messaggio di validazione), `InputSwitch`, `ServerValidator`
(errori Problem Details nella EditForm).

Regola dei layer: **le pagine** orchestrano il flusso, **i componenti** sono solo visuali
(nessuna chiamata HTTP), **i services** fanno HTTP (`ApiClient`) o tengono lo stato
condiviso (`ToastService`).

## 3. Prerequisiti e installazione dell'ambiente

Serve solo il **.NET 10 SDK** (include runtime, compilatore, `dotnet format`, template).
Docker è opzionale (per l'immagine di produzione).

Download ufficiale: <https://dotnet.microsoft.com/download/dotnet/10.0>

### Windows

- **winget** (consigliato): `winget install Microsoft.DotNet.SDK.10`
- oppure l'installer `.exe` dalla pagina di download.
- Percorso di installazione: `C:\Program Files\dotnet\` (aggiunto al `PATH` automaticamente).
- Visual Studio 2026 (o 2022 17.14+) con il workload "ASP.NET e sviluppo Web" include già l'SDK.

### macOS

- **Homebrew**: `brew install --cask dotnet-sdk`
- oppure il pacchetto `.pkg` (Arm64 per Apple Silicon, x64 per Intel) dalla pagina di download.
- Percorso: `/usr/local/share/dotnet/` (link `dotnet` in `/usr/local/bin`).

### Linux

- **Ubuntu 24.04+** (pacchetto dell'archivio Ubuntu):
  `sudo apt-get update && sudo apt-get install -y dotnet-sdk-10.0` → installato in `/usr/lib/dotnet`.
- **Fedora**: `sudo dnf install dotnet-sdk-10.0`.
- **Qualsiasi distro / senza root**: script ufficiale
  ```bash
  curl -sSL https://dot.net/v1/dotnet-install.sh | bash -s -- --channel 10.0 --install-dir ~/.dotnet
  export DOTNET_ROOT="$HOME/.dotnet"
  export PATH="$DOTNET_ROOT:$DOTNET_ROOT/tools:$PATH"   # aggiungilo a ~/.bashrc o ~/.zshrc
  ```

### Verifica

```bash
dotnet --version        # 10.0.xxx
dotnet --list-sdks
```

### Editor consigliati

- **VS Code** + estensioni *C# Dev Kit* (`ms-dotnettools.csdevkit`), *C#* e *EditorConfig*
  (già suggerite in `.vscode/extensions.json`).
- **Visual Studio 2026** (Windows) o **JetBrains Rider** (tutti i sistemi).

Opzionale: **Docker Desktop** (Windows/macOS) o Docker Engine (Linux): <https://docs.docker.com/get-docker/>.

## 4. Installazione delle dipendenze

```bash
cd csharp-frontend-template
dotnet restore CSharpFrontendTemplate.slnx
```

I pacchetti NuGet finiscono nella cache utente (`~/.nuget/packages`, su Windows
`%USERPROFILE%\.nuget\packages`). Al primo restore viene scaricato anche il runtime
WebAssembly (`Microsoft.NETCore.App.Runtime.Mono.browser-wasm`).

## 5. Comandi

| Scopo | Comando |
|---|---|
| Avvio in sviluppo (http://localhost:5200) | `dotnet run --project src/CSharpFrontendTemplate` |
| Sviluppo con hot reload | `dotnet watch --project src/CSharpFrontendTemplate` |
| Build | `dotnet build CSharpFrontendTemplate.slnx` |
| Test | `dotnet test` |
| Coverage (Cobertura) | `dotnet test --coverage --coverage-output-format cobertura` |
| Verifica formattazione | `dotnet format CSharpFrontendTemplate.slnx --verify-no-changes` |
| Applica formattazione | `dotnet format CSharpFrontendTemplate.slnx` |
| Build di produzione | `dotnet publish src/CSharpFrontendTemplate -c Release -o publish` |
| Anteprima produzione | `docker build -t csharp-frontend-template . && docker run --rm -p 8084:80 csharp-frontend-template` |

Note:

- In sviluppo l'app chiama il backend su `http://localhost:3000` (Node.js): avvialo prima
  (es. `nodejs-backend-template`), il suo CORS include già `http://localhost:5200`.
- I test usano **Microsoft.Testing.Platform** (impostato in `global.json`): xUnit v3 4.x
  non supporta più il vecchio runner VSTest con `dotnet test` su .NET 10.
- Il report di coverage viene scritto in `tests/CSharpFrontendTemplate.Tests/bin/Debug/net10.0/TestResults/`.
- `publish/wwwroot` contiene i file statici; per un'anteprima veloce senza Docker:
  `npx serve -s publish/wwwroot` (in quel caso `/api` non è proxato).

## 6. Configurazione

Blazor WebAssembly gira nel browser: **non legge le variabili d'ambiente**. La
configurazione è in `wwwroot/appsettings*.json`, scaricati dal browser all'avvio.

| File | `ApiBaseUrl` | Quando |
|---|---|---|
| `wwwroot/appsettings.json` | `""` (vuoto = stessa origine) | produzione/Docker: nginx fa da proxy di `/api/` |
| `wwwroot/appsettings.Development.json` | `"http://localhost:3000"` | `dotnet run`/`watch` (ambiente Development) |

`ApiBaseUrl` corrisponde al concetto `API_BASE_URL` del contratto: Blazor non ha un proxy
di sviluppo, quindi in dev usa un URL assoluto e si appoggia al CORS del backend.
Per usare un altro backend in sviluppo cambia il valore, ad esempio
`"http://localhost:8000"` (Python) o `"http://localhost:5080"` (.NET).

L'ambiente è `Development` con il dev server (da `launchSettings.json`) e `Production`
quando l'app è servita da nginx.

Variabili del **container**:

| Variabile | Default | Significato |
|---|---|---|
| `API_UPSTREAM` | `http://nodejs-backend-template:3000` | destinazione del proxy nginx per `/api/` |

## 7. Docker

```bash
# build (multi-stage: SDK .NET 10 -> nginx alpine)
docker build -t csharp-frontend-template .

# run: porta interna 80, sull'host 8084
docker run -d --name csharp-frontend-template -p 8084:80 csharp-frontend-template

# backend diverso (es. il backend Python sulla stessa rete Docker)
docker run -d -p 8084:80 -e API_UPSTREAM=http://python-backend-template:8000 csharp-frontend-template

# backend avviato sull'host (Docker Desktop)
docker run -d -p 8084:80 -e API_UPSTREAM=http://host.docker.internal:3000 csharp-frontend-template
```

Apri <http://localhost:8084>. Health check del container: `GET /healthz` (usato da `HEALTHCHECK`).

Con il `docker-compose.yml` della root del repository (servizio con lo stesso nome della cartella):

```bash
docker compose up --build csharp-frontend-template nodejs-backend-template
```

Dettagli dell'immagine:

- nginx risolve `API_UPSTREAM` **a runtime** (`resolver 127.0.0.11` + variabile in
  `proxy_pass`): il container parte anche senza backend, e la Home mostra "Offline".
- `try_files $uri $uri/ /index.html` → fallback SPA (gli URL come `/items` funzionano anche al refresh);
  sotto `/_framework/` un file mancante dà 404 vero.
- MIME: `.wasm` → `application/wasm` (già nel `mime.types` di nginx), `.dat` (dati ICU) →
  `application/octet-stream`, `.js` → `application/javascript`.
- Compressione: `dotnet publish` genera già `.gz` e `.br`. `gzip_static on` serve i `.gz`
  pronti; i `.br` vengono eliminati nel Dockerfile perché l'immagine ufficiale di nginx
  non ha il modulo brotli.
- Cache: `/_framework/*` ha nomi con hash → `immutable` per un anno; `index.html`,
  `appsettings*.json` e CSS → `no-cache` (rivalidati con ETag).
- Il master nginx gira come root per poter ascoltare sulla porta 80 (contratto); i worker
  girano come utente `nginx` non privilegiato.

## 8. Pagine e API usate

| Pagina | Route | Descrizione |
|---|---|---|
| Home | `/` | landing + stato del backend (`GET /api/health`), bottone Retry |
| Components | `/components` | tipografia, bottoni, form con validazione (text, email, select, radio, switch, checkbox, textarea), card, alert, toast, modal, tab, tabella QuickGrid, badge, spinner/stato, navigazione |
| Items | `/items` | CRUD: `GET/POST /api/items`, `PUT/DELETE /api/items/{id}` |
| 404 | qualsiasi altro URL (`/not-found`) | pagina non trovata |

Gestione errori (centralizzata in `ApiClient`): ogni risposta non 2xx o errore di rete
diventa `ApiException` con `StatusCode`, `Problem` (Problem Details) e `ValidationErrors`.
Su un `400` la pagina Items passa `ValidationErrors` a `ServerValidator`, che associa
`"name"` → proprietà `Name` e mostra il messaggio sotto al campo.

## 9. Come aggiungere una nuova risorsa/pagina

Esempio: risorsa `products` esposta dal backend su `/api/products`.

1. **Modelli** in `Models/`:
   - `Product.cs`: `public sealed record Product(string Id, string Name, ...);` (output);
   - `ProductInput.cs`: classe con proprietà `{ get; set; }` e DataAnnotations
     (`[Required]`, `[StringLength]`, `[Range]`) con le stesse regole del backend.
2. **Client API**: aggiungi i metodi a `Services/IApiClient.cs` e implementali in
   `Services/ApiClient.cs` copiando quelli degli items (`SendAsync<T>` gestisce già errori e JSON):
   ```csharp
   public Task<IReadOnlyList<Product>> GetProductsAsync(CancellationToken ct = default) => ...;
   ```
   (per un progetto grande puoi creare un `IProductsApi` separato con lo stesso schema.)
3. **Form**: copia `Components/Items/ItemForm.razor` in `Components/Products/ProductForm.razor`,
   usando `FormField` + input Blazor per ogni campo. Aggiungi
   `@using CSharpFrontendTemplate.Components.Products` in `_Imports.razor`.
4. **Pagina**: copia `Pages/Items.razor` in `Pages/Products.razor`, cambia `@page "/products"`,
   i tipi e le colonne della `QuickGrid`.
5. **Menu**: aggiungi una riga all'array `Links` in `Layout/NavMenu.razor`:
   `("products", "Products", NavLinkMatch.Prefix)`.
6. **Test**: aggiorna `TestUtilities/FakeApiClient.cs` con i nuovi metodi, poi aggiungi
   `Pages/ProductsPageTests.cs` (bUnit) e i casi in `Services/ApiClientTests.cs`.
7. Verifica: `dotnet format --verify-no-changes`, `dotnet build`, `dotnet test`.

Per un **nuovo componente UI**: crea `Components/Ui/NomeComponente.razor` con parametri
`[Parameter]`, solo markup e stili (classi in `wwwroot/css/app.css`, valori da
`tokens.css`), aggiungi un esempio in `Pages/Components.razor` + snippet in
`Components/Showcase/ShowcaseSnippets.cs` e un test bUnit in `tests/.../Components/`.

## 10. Problemi comuni

| Sintomo | Causa / soluzione |
|---|---|
| Home "Offline" in sviluppo | il backend non è avviato su `http://localhost:3000`, oppure il suo `CORS_ORIGINS` non include `http://localhost:5200` |
| Home "Offline" in Docker | `API_UPSTREAM` errato o backend non sulla stessa rete Docker; controlla `docker logs` e prova `curl http://localhost:8084/api/health` |
| Errore CORS nella console del browser | aggiungi l'origine del frontend a `CORS_ORIGINS` del backend |
| `A compatible .NET SDK was not found` | installa un SDK 10.0.100 o superiore (vedi `global.json`) |
| `Testing with VSTest target is no longer supported` | usa `dotnet test` dalla cartella del template (serve il `global.json` con `Microsoft.Testing.Platform`) |
| Build fallisce per un warning | `TreatWarningsAsErrors` è voluto: correggi il warning; per lo stile esegui `dotnet format` |
| Modifiche a CSS/appsettings non visibili | ricarica forzata (Ctrl+F5): il browser rivalida ma alcune estensioni cacheano |
| Pagina bianca dopo il deploy in sottocartella | imposta `<base href="/sottocartella/" />` in `wwwroot/index.html` |
| `docker build` fallisce su `dotnet restore` con errori di certificato | sei dietro un proxy aziendale con TLS interception: aggiungi il certificato della CA nel solo stage di build |
| Porta 5200 occupata | cambia `applicationUrl` in `Properties/launchSettings.json` (e aggiorna il CORS del backend) |

## 11. Comandi utili extra

```bash
dotnet --info                                   # SDK, runtime e workload installati
dotnet list package --outdated                  # pacchetti aggiornabili
dotnet list package --vulnerable                # pacchetti con vulnerabilità note
dotnet test --filter-method "*ItemsPageTests*"  # esegue solo alcuni test (MTP + xUnit v3)
dotnet clean && rm -rf **/bin **/obj            # pulizia completa
dotnet new razorcomponent -n MyCard -o src/CSharpFrontendTemplate/Components/Ui  # nuovo componente
docker logs -f csharp-frontend-template        # log di nginx
docker exec csharp-frontend-template cat /etc/nginx/conf.d/default.conf  # config nginx generata
```
