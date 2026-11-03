# Angular Template

Template frontend **Angular 22 + Angular Material** pronto da copiare: componenti standalone,
signal, nuovo control flow (`@if` / `@for`), app _zoneless_, routing con lazy loading, client API
tipizzato, interceptor HTTP per gli errori, CRUD completo su `/api/items` con Reactive Forms
tipizzati e mappatura degli errori **Problem Details** (RFC 9457) sui campi del form.

Funziona con **qualsiasi backend** del repository: tutti rispettano lo stesso contratto
([`docs/api-contract.md`](../docs/api-contract.md)).

## 1. Stack e versioni

Versioni usate per scrivere e verificare questa guida (novembre 2026):

| Componente                     | Versione                | Note                                                  |
| ------------------------------ | ----------------------- | ----------------------------------------------------- |
| Node.js                        | 26.13.0 LTS ("Lithium") | supportati anche 22.22.3+ e 24.15+ (`engines`)        |
| npm                            | 10.9+ / 11.x            | incluso in Node.js                                    |
| Angular (core, router, forms)  | 22.2.4                  | standalone, signal, zoneless e OnPush di default      |
| Angular CLI / `@angular/build` | 22.2.5                  | builder `@angular/build:application` (esbuild + Vite) |
| Angular Material / CDK         | 22.2.5                  | tema Material 3                                       |
| TypeScript                     | 6.0.3                   | versione richiesta da Angular 22 (`~6.0`)             |
| RxJS                           | 7.8.2                   |                                                       |
| Vitest (+ jsdom)               | 5.1.0 (jsdom 30.1.3)    | test runner di default di Angular 22 (`ng test`)      |
| ESLint / angular-eslint        | 10.14.0 / 22.6.0        | con `typescript-eslint` 8.71                          |
| Prettier                       | 3.9.10                  | + `eslint-config-prettier` 10.1.8                     |
| Immagine Docker build          | `node:26.13.0-alpine`   |                                                       |
| Immagine Docker runtime        | `nginx:1.30.6-alpine`   | ramo stable di nginx                                  |

## 2. Struttura delle cartelle

```text
angular-template/
├── angular.json             # configurazione Angular CLI (build, serve con proxy, test, lint)
├── proxy.conf.js            # proxy dev: /api -> API_PROXY_TARGET (default http://localhost:3000)
├── eslint.config.js         # ESLint flat config (TypeScript + Angular + template a11y)
├── .prettierrc              # Prettier (formattazione)
├── Dockerfile               # build multi-stage Node -> nginx
├── nginx/default.conf.template  # config nginx: SPA fallback, proxy /api, gzip, cache
├── public/                  # file statici copiati cosi' come sono (favicon, ...)
└── src/
    ├── index.html           # pagina host (font Roboto e icone Material Symbols)
    ├── main.ts              # bootstrap dell'app
    ├── styles.scss          # UNICO file di tema e design token (Material 3 + --app-*)
    └── app/
        ├── app.ts|html|scss # shell: toolbar responsive, menu mobile, <router-outlet>
        ├── app.config.ts    # provider globali: router, HttpClient + interceptor, Material
        ├── app.routes.ts    # rotte (tutte lazy)
        ├── nav-links.ts     # voci del menu
        ├── core/            # singleton applicativi, nessuna UI
        │   ├── config/      # API_BASE_URL (default "/api")
        │   ├── http/        # ApiClient, errorInterceptor, ApiError / Problem Details
        │   ├── models/      # DTO del contratto (Item, ItemInput, HealthStatus)
        │   ├── notifications/ # NotificationService (toast MatSnackBar)
        │   └── state/       # BackendStatusStore (stato globale a signal)
        ├── shared/          # riusabile e presentazionale
        │   ├── forms/       # validator, messaggi d'errore, pipe, applyServerErrors
        │   └── ui/          # Alert, LoadingButton, StatusIndicator, ConfirmDialog,
        │                    # PageHeader, EmptyState, CodeSnippet, ShowcaseSection
        └── features/        # una cartella per pagina/feature
            ├── home/        # Home con stato del backend
            ├── showcase/    # pagina "Components" + demos/ (un componente per esempio)
            ├── items/       # CRUD: routes, store, lista, pagina edit, item-form/
            └── not-found/   # pagina 404
```

Flusso dei dati: **pagina → store (signal) → ApiClient → HttpClient → interceptor**.
Le pagine non fanno mai HTTP; i componenti in `shared/ui` non conoscono né store né HTTP.

## 3. Prerequisiti e installazione dell'ambiente

Serve solo **Node.js LTS** (npm è incluso). Angular CLI non va installato globalmente: si usa
quello del progetto con `npx ng ...` o con gli script `npm run ...`.

### Windows

- Installer ufficiale: <https://nodejs.org/en/download> (file `.msi`, versione **LTS**).
  Si installa in `C:\Program Files\nodejs\` e viene aggiunto al `PATH`.
- Oppure con winget: `winget install OpenJS.NodeJS.LTS`
- Oppure con un version manager: [fnm](https://github.com/Schniz/fnm)
  (`winget install Schniz.fnm`, poi `fnm install --lts`) o [nvm-windows](https://github.com/coreybutler/nvm-windows).

### macOS

- Installer ufficiale `.pkg` da <https://nodejs.org/en/download> (installa in `/usr/local/bin`).
- Oppure Homebrew: `brew install node@26` (in `/opt/homebrew/opt/node@26`, segui le istruzioni
  di `brew` per aggiungerlo al `PATH`).
- Consigliato un version manager: [nvm](https://github.com/nvm-sh/nvm)
  (`nvm install --lts`, installa in `~/.nvm`) oppure `brew install fnm && fnm install --lts`.

### Linux

- Consigliato [nvm](https://github.com/nvm-sh/nvm):
  `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash`,
  poi `nvm install --lts` (installa in `~/.nvm/versions/node/`).
- Oppure i pacchetti NodeSource per apt/dnf: <https://github.com/nodesource/distributions>
  (installa in `/usr/bin/node`). Evita le versioni dei repository di default, spesso vecchie.

### Verifica

```bash
node --version    # v26.x (o 22.22.3+ / 24.15+)
npm --version
```

### Docker (opzionale)

[Docker Desktop](https://www.docker.com/products/docker-desktop/) su Windows/macOS,
Docker Engine su Linux (<https://docs.docker.com/engine/install/>). Verifica: `docker --version`.

### Editor consigliato

[VS Code](https://code.visualstudio.com/) con le estensioni:
**Angular Language Service** (`angular.ng-template`, già suggerita in `.vscode/extensions.json`),
**ESLint** (`dbaeumer.vscode-eslint`), **Prettier** (`esbenp.prettier-vscode`).
In alternativa WebStorm, che supporta Angular nativamente.

## 4. Installazione delle dipendenze

```bash
cd angular-template
npm ci        # installa esattamente le versioni di package-lock.json
# (npm install solo quando aggiungi/aggiorni pacchetti)
```

## 5. Comandi

| Comando                 | Cosa fa                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| `npm start`             | dev server su <http://localhost:4200> con proxy `/api` e live reload  |
| `npm run build`         | build di produzione in `dist/angular-template/browser`                |
| `npm run watch`         | build di sviluppo continua                                            |
| `npm test`              | test Vitest in watch mode (jsdom, nessun browser necessario)          |
| `npm run test:ci`       | test una sola volta (per CI)                                          |
| `npm run test:coverage` | test + report di coverage in `coverage/`                              |
| `npm run lint`          | ESLint su TypeScript e template HTML                                  |
| `npm run lint:fix`      | ESLint con correzioni automatiche                                     |
| `npm run format`        | formatta tutto con Prettier (`format:check` per verificare soltanto)  |
| `npm run preview`       | serve la build di **produzione** su :4200, sempre con il proxy `/api` |

Per un backend avviato su un'altra porta:

```bash
# macOS / Linux
API_PROXY_TARGET=http://localhost:8000 npm start
# Windows PowerShell
$env:API_PROXY_TARGET="http://localhost:8000"; npm start
```

## 6. Configurazione

| Dove                                | Variabile / valore             | Default                               | Significato                                       |
| ----------------------------------- | ------------------------------ | ------------------------------------- | ------------------------------------------------- |
| `proxy.conf.js` (solo `ng serve`)   | `API_PROXY_TARGET`             | `http://localhost:3000`               | backend a cui inoltrare `/api` in sviluppo        |
| Docker / nginx                      | `API_UPSTREAM`                 | `http://nodejs-backend-template:3000` | backend a cui nginx inoltra `/api/`               |
| `src/app/core/config/api-config.ts` | `API_BASE_URL`                 | `/api`                                | prefisso delle chiamate (relativo di default)     |
| `src/styles.scss`                   | token `--app-*`, `mat.theme()` | palette azure, Roboto                 | colori, spaziature, tipografia, tema chiaro/scuro |

Il codice usa sempre URL **relativi** `/api/...`: nessuna variabile va "compilata" nel bundle.
Per il tema scuro cambia `color-scheme: light` in `light dark` (segue il sistema) o `dark`
in `src/styles.scss`.

## 7. Docker

```bash
docker build -t angular-template .
# senza backend: la UI funziona e lo stato mostra "Offline" (/api risponde 502)
docker run --rm -p 8082:80 angular-template
# con un backend raggiungibile dal container
docker run --rm -p 8082:80 -e API_UPSTREAM=http://host.docker.internal:3000 angular-template
```

Apri <http://localhost:8082>. Dettagli dell'immagine:

- porta interna **80**, porta host suggerita **8082** (come nel `docker-compose.yml` della root);
- nginx gira come utente non-root `nginx`; `HEALTHCHECK` su `GET /healthz`;
- fallback SPA (`try_files ... /index.html`), gzip, cache immutabile per gli asset con hash,
  `no-cache` per `index.html`;
- `/api/` viene inoltrato a `API_UPSTREAM` risolto **a runtime** dal DNS di Docker
  (`resolver 127.0.0.11`), quindi il container parte anche se il backend non c'è.

Con il compose della root (servizio `angular-template`), insieme al backend Node.js:

```bash
cd ..   # root del repository
docker compose up --build angular-template nodejs-backend-template
```

## 8. Pagine e API usate

| Rotta             | Pagina                                                       |
| ----------------- | ------------------------------------------------------------ |
| `/`               | Home con indicatore di stato del backend (`GET /api/health`) |
| `/components`     | Showcase Angular Material con codice copiabile               |
| `/items`          | Lista items (tabella, elimina con conferma)                  |
| `/items/new`      | Creazione item (`POST /api/items`)                           |
| `/items/:id/edit` | Modifica item (`GET` + `PUT /api/items/{id}`)                |
| qualsiasi altra   | 404                                                          |

Gestione errori: l'`errorInterceptor` converte ogni errore in `ApiError`; per rete assente e
5xx mostra un toast, i 4xx sono gestiti dalla pagina. I `400` di validazione vengono mappati
sui campi del form (`errors.name` → campo `name`) con `applyServerErrors`.

## 9. Come aggiungere una nuova risorsa/pagina

Esempio: risorsa `products` esposta dal backend su `/api/products`.

1. **DTO**: crea `src/app/core/models/product.ts` con `Product` e `ProductInput`
   (copia `item.ts`).
2. **API**: aggiungi a `ApiClient` (`core/http/api-client.ts`) i metodi `listProducts()`,
   `getProduct(id)`, `createProduct(input)`, ... usando `this.url('products', id)`.
   Aggiungi i test in `api-client.spec.ts`.
3. **Store**: copia `features/items/items-store.ts` in `features/products/products-store.ts`
   e sostituisci le chiamate.
4. **Pagine e form**: copia `items-list-page.*`, `item-edit-page.*` e `item-form/` adattando
   colonne e campi. I validator riusabili sono in `shared/forms/app-validators.ts`; i messaggi
   in `shared/forms/error-messages.ts`.
5. **Rotte**: crea `features/products/products.routes.ts` (come `items.routes.ts`, con
   `providers: [ProductsStore]`) e registralo in `app.routes.ts`:
   ```ts
   { path: 'products', loadChildren: () => import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES) },
   ```
   sempre **prima** della rotta `'**'`.
6. **Menu**: aggiungi `{ path: '/products', label: 'Products', icon: 'sell', exact: false }`
   in `nav-links.ts`.
7. **Test**: copia gli spec di items; esegui `npm run lint && npm run test:ci && npm run build`.

Per una pagina semplice senza dati basta un componente in `features/<nome>/` e una rotta con
`loadComponent`. Si può generare lo scheletro con `npx ng generate component features/<nome>/<nome>-page`.

## 10. Problemi comuni

- **Stato "Offline" in sviluppo**: il backend non gira su `localhost:3000`. Avvialo o imposta
  `API_PROXY_TARGET`. Controlla il terminale di `ng serve` per errori `ECONNREFUSED`.
- **`Port 4200 is already in use`**: chiudi l'altro processo o usa `npx ng serve --port 4201`.
- **Errore `engines` / versione Node non supportata**: usa Node LTS (`nvm use --lts`).
- **Icone mostrate come testo ("home", "menu")**: il font Material Symbols è caricato da Google
  Fonts in `index.html`; offline o in reti filtrate non arriva. Si può installare il pacchetto
  `material-symbols` e importarlo in `styles.scss`.
- **Warning di budget in build**: i limiti sono in `angular.json` → `budgets`. Ogni modulo
  Material importato nella shell finisce nel bundle iniziale: importa i moduli nelle pagine lazy.
- **Docker: `/api` risponde 502**: il backend indicato da `API_UPSTREAM` non è raggiungibile
  dalla rete del container (usa il nome del servizio compose o `host.docker.internal`).
- **Docker: `nginx: [emerg] bind() to 0.0.0.0:80 failed (13: Permission denied)`** su
  Kubernetes/Podman: l'utente non-root non può aprire porte < 1024 se il runtime non imposta
  `net.ipv4.ip_unprivileged_port_start=0`; imposta quel sysctl o cambia `listen` in 8080.
- **`npm ci` fallisce in Docker con `SELF_SIGNED_CERT_IN_CHAIN`**: c'è un proxy aziendale che
  ispeziona il TLS; aggiungi il certificato della CA allo stage di build
  (`NODE_EXTRA_CA_CERTS`).

## 11. Comandi utili extra

```bash
npx ng version                         # versioni di Angular e dell'ambiente
npx ng generate component features/x/x-page   # nuovo componente (alias: ng g c)
npx ng generate service core/x/x       # nuovo service
npx ng update                          # controlla aggiornamenti di Angular
npx ng update @angular/core @angular/cli @angular/material   # aggiorna con migrazioni automatiche
npm outdated                           # dipendenze non aggiornate
npx ng test --watch=false --include='src/app/features/items/**'   # solo alcuni test
docker compose logs -f angular-template                       # log del container
```
