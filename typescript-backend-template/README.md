# typescript-backend-template

Template **backend** REST in **TypeScript** su **Node.js 26 LTS**, costruito con **Fastify**,
validazione tipizzata con **TypeBox**, build di produzione con **Vite** (modalità SSR) e test
con **Vitest**. Implementa il contratto API comune del repository
([`docs/api-contract.md`](../docs/api-contract.md)): `GET /api/health` e un CRUD in memoria
su `/api/items`, errori in formato **Problem Details** (RFC 9457), documentazione
**OpenAPI/Swagger** su `/docs`.

Porta: **3001** sia in locale sia nel container (in `docker compose` è esposta sull'host come `8088`).

## 1. Stack e versioni

Versioni esatte usate per scrivere e verificare questa guida (novembre 2026):

| Componente                     | Versione              | Ruolo                                               |
| ------------------------------ | --------------------- | --------------------------------------------------- |
| Node.js                        | 26.13.0 (LTS)         | runtime; esegue TypeScript nativamente in sviluppo  |
| npm                            | 11.20.0               | package manager (incluso in Node)                   |
| TypeScript                     | 6.0.3                 | type-check (`tsc --noEmit`)                         |
| Fastify                        | 5.12.8                | framework HTTP                                      |
| @fastify/cors                  | 11.4.0                | CORS                                                |
| @fastify/swagger               | 9.9.3                 | generazione OpenAPI 3.1 dagli schemi                |
| @fastify/swagger-ui            | 6.1.2                 | Swagger UI su `/docs`                               |
| @fastify/type-provider-typebox | 6.3.0                 | tipi TypeScript dedotti dagli schemi                |
| typebox                        | 1.4.3                 | schemi JSON Schema tipizzati                        |
| ajv / ajv-formats              | 8.20.0 / 3.0.1        | validatore JSON Schema (lo stesso usato da Fastify) |
| pino                           | 10.4.0                | logging JSON strutturato (integrato in Fastify)     |
| fastify-plugin                 | 6.0.1                 | plugin condivisi a livello di app                   |
| Vite                           | 8.3.5                 | build di produzione (SSR) -> `dist/server.js`       |
| Vitest                         | 5.1.0                 | test unit e di integrazione                         |
| @vitest/coverage-v8            | 5.1.0                 | coverage                                            |
| ESLint                         | 10.14.0               | linter (flat config)                                |
| typescript-eslint              | 8.72.1                | regole ESLint per TypeScript                        |
| Prettier                       | 3.9.10                | formatter                                           |
| pino-pretty                    | 13.2.0                | log leggibili in sviluppo                           |
| Immagine Docker                | `node:26.13.0-alpine` | build e runtime                                     |

### Perché queste scelte

- **TypeScript 6.0 e non 7.0.** TypeScript 7 (il compilatore riscritto in Go) è uscito, ma
  `typescript-eslint` 8.72 supporta ufficialmente solo `typescript >=4.8.4 <6.1.0`: con il 7
  il linting con informazioni di tipo non è supportato. Si usa quindi l'ultima 6.0.x
  (fissata con `~6.0.3`). Quando `typescript-eslint` supporterà la 7 basterà aggiornare.
- **Vite 8 e Vitest 5** sono compatibili tra loro (Vitest 5 richiede `vite ^6.4 || ^7 || ^8`)
  e con Node 26: si usano le ultime major.
- **TypeBox invece di Zod.** Uno schema TypeBox _è_ un JSON Schema: Fastify lo usa
  direttamente per validare con Ajv (compilato, molto veloce), per serializzare le risposte
  con `fast-json-stringify` e per generare l'OpenAPI con `@fastify/swagger`, senza
  conversioni. `Static<typeof Schema>` ne ricava il tipo TypeScript. Con Zod servirebbe uno
  strato di conversione Zod -> JSON Schema (`fastify-type-provider-zod`) e si
  perderebbe la serializzazione veloce. Unico svantaggio: JSON Schema valida ma non
  trasforma, quindi il _trim_ di `name` è fatto da un piccolo hook (`src/utils/trim-body-fields.ts`).
- **`node --watch` invece di `tsx watch`.** Node 26 (come già Node 24 e 22.18+) esegue file
  `.ts` nativamente con il "type stripping": cancella le annotazioni di tipo senza compilare.
  Quindi in sviluppo non serve nessun tool esterno. Il prezzo: si può usare solo sintassi
  TypeScript "cancellabile" (niente `enum`, `namespace`, _parameter properties_ come
  `constructor(private repo: Repo)`) e gli import relativi devono avere l'estensione `.ts`.
  `tsconfig.json` impone queste regole (`erasableSyntaxOnly`, `allowImportingTsExtensions`).
- **Niente dotenv.** Node carica il file `.env` da solo con `--env-file-if-exists=.env`.

### Perché Vite in un backend?

Vite è noto come dev server per frontend, ma sotto è un bundler generico (in Vite 8 basato
su Rolldown). Qui ognuno ha un compito preciso:

| Tool           | Quando                               | Cosa fa                                                                                                                                                                                                                                  |
| -------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node --watch` | `npm run dev`                        | esegue `src/server.ts` direttamente (type stripping) e riavvia a ogni modifica                                                                                                                                                           |
| `tsc --noEmit` | `npm run typecheck`, `npm run build` | controlla i tipi; **non** produce file                                                                                                                                                                                                   |
| `vite build`   | `npm run build`                      | modalità **SSR**: impacchetta `src/server.ts` e tutti i nostri moduli in un unico `dist/server.js` ESM per Node, con source map; le dipendenze di `node_modules` restano _esterne_ (si installano in produzione con `npm ci --omit=dev`) |
| `vitest`       | `npm test`                           | test runner che usa la stessa pipeline di trasformazione di Vite: legge TypeScript ed ESM senza configurazioni extra, è veloce e ha un'API compatibile con Jest                                                                          |

Vantaggi: un'unica configurazione (`vite.config.ts`) per build e test, output piccolo e
avviabile con `node dist/server.js`, nessuna compilazione file-per-file con `tsc`.

## 2. Struttura delle cartelle

```text
typescript-backend-template/
├── src/
│   ├── server.ts              # avvio del processo: listen + graceful shutdown (SIGINT/SIGTERM)
│   ├── app.ts                 # factory buildApp(): compone plugin, dipendenze e rotte (testabile)
│   ├── config/env.ts          # lettura e validazione delle variabili d'ambiente (fail fast)
│   ├── plugins/               # aspetti trasversali: error handler, CORS, Swagger, validazione Ajv, request id
│   ├── routes/                # metodo + percorso + schema -> handler; index.ts monta tutto sotto /api
│   ├── controllers/           # layer HTTP sottile: legge la request, chiama il service, imposta status/header
│   ├── services/              # logica di business (casi d'uso), nessuna conoscenza di HTTP
│   ├── repositories/          # interfaccia ItemRepository + implementazione in memoria con 3 item seed
│   ├── schemas/               # schemi TypeBox: DTO di input/output e schema completo di ogni rotta
│   ├── errors/                # AppError/NotFoundError/ValidationError, Problem Details, mappatura errori Ajv
│   └── utils/                 # helper: tipi request/reply TypeBox, hook di trim
├── tests/
│   ├── unit/                  # service, repository, config
│   ├── integration/           # tutte le rotte via app.inject() (successi ed errori)
│   └── helpers/test-app.ts    # crea un'app isolata con log spenti
├── vite.config.ts             # build SSR (Vite) + configurazione test (Vitest)
├── tsconfig.json              # TypeScript strict, ESM NodeNext
├── eslint.config.js           # ESLint flat config + typescript-eslint + prettier
├── .prettierrc.json
├── .env.example               # variabili d'ambiente documentate
├── Dockerfile                 # multi-stage, runtime solo dist + dipendenze di produzione
└── .nvmrc                     # versione di Node consigliata (26)
```

Flusso di una richiesta: `routes` (schema: validazione) -> `controllers` -> `services` ->
`repositories`. Gli errori risalgono fino a `plugins/error-handler.ts`, che li trasforma in
Problem Details.

## 3. Prerequisiti e installazione dell'ambiente

Serve **Node.js 26 LTS** (minimo supportato: 24). npm è incluso.
Download ufficiale: <https://nodejs.org/en/download>.

### Windows

- **Installer ufficiale**: scarica il `.msi` "LTS" da <https://nodejs.org/en/download> ed eseguilo.
  Viene installato in `C:\Program Files\nodejs\` e aggiunto al `PATH`.
- **winget** (PowerShell):
  ```powershell
  winget install OpenJS.NodeJS.LTS
  ```
- **Version manager** consigliato, [fnm](https://github.com/Schniz/fnm):
  ```powershell
  winget install Schniz.fnm
  fnm install 26 ; fnm use 26
  ```
  (segui le istruzioni di fnm per aggiungere `fnm env --use-on-cd | Out-String | Invoke-Expression` al profilo PowerShell).

### macOS

- **Installer ufficiale** `.pkg` da <https://nodejs.org/en/download> (installa in `/usr/local/bin/node`).
- **Homebrew**:
  ```bash
  brew install node@26
  brew link --overwrite node@26
  ```
  (installato in `/opt/homebrew/opt/node@26` su Apple Silicon, `/usr/local/opt/node@26` su Intel).
- **Version manager** [nvm](https://github.com/nvm-sh/nvm) o fnm (`brew install fnm`):
  ```bash
  nvm install 26 && nvm use 26     # oppure: fnm install 26 && fnm use 26
  ```

### Linux

- **Version manager (consigliato)**, nvm:
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  # riapri il terminale, poi:
  nvm install 26 && nvm use 26
  ```
  Node viene installato in `~/.nvm/versions/node/`. Nella cartella del progetto `nvm use`
  legge automaticamente `.nvmrc`.
- **Pacchetti di sistema** (Debian/Ubuntu, Fedora/RHEL) tramite NodeSource:
  <https://github.com/nodesource/distributions> (installa in `/usr/bin/node`).
  ```bash
  # Debian/Ubuntu
  curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash - && sudo apt-get install -y nodejs
  # Fedora/RHEL
  curl -fsSL https://rpm.nodesource.com/setup_26.x | sudo bash - && sudo dnf install -y nodejs
  ```

### Verifica

```bash
node --version   # v26.x.x
npm --version    # 11.x.x
```

### Docker (opzionale)

[Docker Desktop](https://www.docker.com/products/docker-desktop/) su Windows/macOS,
[Docker Engine](https://docs.docker.com/engine/install/) su Linux. Verifica con `docker --version`.

### Editor consigliato

[Visual Studio Code](https://code.visualstudio.com/) con le estensioni proposte in
`.vscode/extensions.json`: **ESLint** (`dbaeumer.vscode-eslint`), **Prettier**
(`esbenp.prettier-vscode`), **Vitest** (`vitest.explorer`). `.vscode/settings.json` attiva
formattazione al salvataggio e fix ESLint. In alternativa WebStorm supporta tutto nativamente.

## 4. Installazione delle dipendenze

```bash
cd typescript-backend-template
npm ci          # installa esattamente le versioni di package-lock.json (consigliato)
# oppure: npm install   (se modifichi le dipendenze)
cp .env.example .env    # opzionale: su Windows PowerShell -> Copy-Item .env.example .env
```

## 5. Comandi

| Comando                                   | Cosa fa                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `npm run dev`                             | sviluppo con hot reload (`node --watch`), log colorati con pino-pretty, su <http://localhost:3001> |
| `npm run build`                           | type-check + `vite build` -> `dist/server.js`                                                      |
| `npm start`                               | avvia la build di produzione (`node dist/server.js`, carica `.env` se presente)                    |
| `npm test`                                | tutti i test una volta (unit + integrazione)                                                       |
| `npm run test:watch`                      | test in modalità watch                                                                             |
| `npm run coverage`                        | test con coverage (report testuale + HTML in `coverage/index.html`)                                |
| `npm run lint` / `npm run lint:fix`       | ESLint (con correzione automatica)                                                                 |
| `npm run format` / `npm run format:check` | Prettier (scrive / controlla)                                                                      |
| `npm run typecheck`                       | solo controllo dei tipi                                                                            |

Anteprima di produzione in locale:

```bash
npm run build && npm start
```

## 6. Configurazione

Variabili d'ambiente (validate all'avvio in `src/config/env.ts`; se un valore è sbagliato il
processo termina con un messaggio esplicito, es. `Invalid environment configuration: PORT ...`):

| Variabile      | Default                                                                | Significato                                                  |
| -------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| `PORT`         | `3001`                                                                 | porta HTTP                                                   |
| `HOST`         | `0.0.0.0`                                                              | interfaccia di ascolto                                       |
| `CORS_ORIGINS` | porte dei frontend (`http://localhost:5173,...,http://localhost:8084`) | origini consentite separate da virgola; `*` = tutte          |
| `LOG_LEVEL`    | `info`                                                                 | `fatal`, `error`, `warn`, `info`, `debug`, `trace`, `silent` |
| `NODE_ENV`     | `development`                                                          | `development`, `test`, `production`                          |

In locale si mettono in `.env` (vedi `.env.example`); le variabili già presenti
nell'ambiente hanno la precedenza sul file. In Docker si passano con `-e` o con `environment:`
nel compose.

Log: una riga JSON per evento con `reqId`; lo stesso id è restituito nell'header
`X-Request-Id` (o riusato se il client/proxy lo invia). Gli header `authorization` e
`cookie` sono oscurati.

## 7. Docker

```bash
docker build -t typescript-backend-template .
docker run --rm -p 3001:3001 typescript-backend-template
# con variabili:
docker run --rm -p 3001:3001 -e LOG_LEVEL=debug -e CORS_ORIGINS=http://localhost:8083 typescript-backend-template
```

Poi apri <http://localhost:3001/api/health> e <http://localhost:3001/docs>.

L'immagine è multi-stage: lo stage `build` esegue type-check e `vite build`, lo stage `deps`
installa solo le dipendenze di produzione, il runtime contiene solo `dist/`, `node_modules` di
produzione e `package.json`, gira come utente `node` (non root) e ha un `HEALTHCHECK` su
`/api/health` (stato visibile con `docker ps`). `docker stop` invia SIGTERM e il server si
spegne in modo ordinato.

Con il `docker-compose.yml` della root del repository (servizio con lo stesso nome della cartella):

```bash
docker compose up --build typescript-backend-template
```

Il servizio è raggiungibile su <http://localhost:8088> (porta host) -> 3001 (container).
I frontend in compose possono puntarlo con `API_UPSTREAM=http://typescript-backend-template:3001`.

## 8. API disponibili

Documentazione interattiva: **Swagger UI su `/docs`**, specifica OpenAPI 3.1 su `/docs/json`.

| Metodo   | Rotta             | Successo                                     | Errori       |
| -------- | ----------------- | -------------------------------------------- | ------------ |
| `GET`    | `/api/health`     | `200` `{ status, service, timestamp }`       | -            |
| `GET`    | `/api/items`      | `200` array di Item ordinati per `createdAt` | -            |
| `GET`    | `/api/items/{id}` | `200` Item                                   | `404`        |
| `POST`   | `/api/items`      | `201` Item + header `Location`               | `400`        |
| `PUT`    | `/api/items/{id}` | `200` Item aggiornato                        | `400`, `404` |
| `DELETE` | `/api/items/{id}` | `204` senza corpo                            | `404`        |

Item: `id` (UUID v4), `name` (1-100 caratteri dopo il trim), `description` (stringa fino a
500 caratteri o `null`), `price` (numero `>= 0`), `createdAt`, `updatedAt` (ISO 8601 UTC).
All'avvio ci sono 3 item di esempio; i dati si azzerano al riavvio. Campi sconosciuti nel
body vengono ignorati; `"price": "10"` (stringa) è un errore, non viene convertito.

Esempi:

```bash
curl http://localhost:3001/api/items
curl -i -X POST http://localhost:3001/api/items \
  -H 'content-type: application/json' -d '{"name":"Lamp","price":19.9}'
curl -X POST http://localhost:3001/api/items \
  -H 'content-type: application/json' -d '{"price":-1}'
```

Errore di validazione (`application/problem+json`):

```json
{
  "type": "about:blank",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "errors": {
    "name": ["name is required"],
    "price": ["price must be greater than or equal to 0"]
  }
}
```

`404` (item o rotta inesistente) ha la stessa forma senza `errors`; un errore inatteso
restituisce `500` con `detail: "An unexpected error occurred."` e il dettaglio completo
(stack incluso) finisce solo nei log.

## 9. Come aggiungere una nuova risorsa (es. `orders`)

1. **Schemi** - `src/schemas/order.schema.ts`: definisci `OrderSchema` (output),
   `OrderInputSchema` (input) con TypeBox e gli schemi delle rotte
   (`listOrdersSchema`, `createOrderSchema`, ...) includendo le risposte di errore con
   `ProblemDetailsSchema`. Esporta i tipi con `Static<typeof ...>`.
2. **Repository** - `src/repositories/order.repository.ts` con il modello `Order` e
   l'interfaccia `OrderRepository`; poi `in-memory-order.repository.ts` che la implementa
   (copia `in-memory-item.repository.ts`).
3. **Service** - `src/services/order.service.ts`: riceve il repository nel costruttore,
   contiene le regole, lancia `NotFoundError('Order', id)` o `ValidationError({...})` per i
   casi attesi. Niente `request`/`reply` qui.
4. **Controller** - `src/controllers/order.controller.ts` (+ mapper verso il DTO): handler
   tipizzati con `FastifyRequestTypeBox<typeof createOrderSchema>`, scelgono status code
   e header. Non catturare gli errori: ci pensa l'error handler.
5. **Rotte** - `src/routes/order.routes.ts` sul modello di `item.routes.ts`, poi registrale
   in `src/routes/index.ts`:
   ```ts
   await app.register(orderRoutes, { prefix: '/orders', controller: controllers.orders });
   ```
6. **Composizione** - in `src/app.ts` crea repository, service e controller e aggiungili
   all'oggetto `controllers` (aggiorna anche `ApiRoutesOptions`). Il tag Swagger si aggiunge
   in `src/plugins/swagger.ts`.
7. **Test** - unit test del service in `tests/unit/` e test HTTP in `tests/integration/`
   con `buildTestApp()` e `app.inject()`.
8. Verifica: `npm run lint && npm run typecheck && npm test`.

Ricorda: import relativi **con estensione `.ts`**, niente `enum` (usa union di stringhe o
oggetti `as const`) e niente parameter properties nel costruttore.

## 10. Problemi comuni

- **`EADDRINUSE: address already in use :::3001`** - la porta è occupata: chiudi l'altro
  processo (`lsof -i :3001` su macOS/Linux, `netstat -ano | findstr :3001` su Windows) o
  usa `PORT=3002` nel `.env`.
- **`ERR_UNKNOWN_FILE_EXTENSION ".ts"` o errori di sintassi su `npm run dev`** - Node è
  troppo vecchio: serve Node 24+ (consigliato 26). Controlla `node --version`.
- **`TypeScript enum is not supported in strip-only mode`** - hai usato sintassi non
  cancellabile (enum, namespace, parameter properties): riscrivila (vedi sezione 9).
- **`Cannot find module '.../foo'`** - negli import relativi manca l'estensione `.ts`.
- **`.env not found. Continuing without it.`** - messaggio informativo di Node: il file
  `.env` è opzionale.
- **Il browser blocca le chiamate (errore CORS)** - aggiungi l'origine del frontend a
  `CORS_ORIGINS`.
- **`Invalid environment configuration: ...`** - una variabile d'ambiente ha un valore non
  valido: il messaggio indica quale.
- **Avvisi di `npm audit`** - al momento della stesura sono segnalate vulnerabilità
  _moderate_ in dipendenze transitive di ESLint (`minimatch`) e di `@fastify/swagger-ui`
  (`glob` via `@fastify/static`); `npm audit fix --force` proporrebbe downgrade di major,
  da non applicare. Ricontrolla con `npm audit` e aggiorna quando escono le correzioni.
- **Prima `npm ci` fallisce in Docker dietro un proxy aziendale con certificati propri** -
  il container non conosce la CA del proxy: aggiungila allo stage di build
  (`NODE_EXTRA_CA_CERTS`) oppure usa un registry mirror interno.

## 11. Comandi utili extra

```bash
npm outdated                         # dipendenze aggiornabili
npx vitest run tests/unit            # solo i unit test
npx vitest run -t "POST /api/items"  # solo i test il cui nome contiene il testo
LOG_LEVEL=debug npm run dev          # log più dettagliati (Windows: imposta LOG_LEVEL nel .env)
curl -s http://localhost:3001/docs/json > openapi.json   # esporta la specifica OpenAPI
docker ps                            # colonna STATUS mostra (healthy)/(unhealthy)
docker logs -f <container>           # log JSON del container
```
