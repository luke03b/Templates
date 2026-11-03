# nodejs-backend-template

Template backend **Node.js in JavaScript puro (ESM)** con **Express 5**, pronto da copiare per nuovi progetti.
Implementa il contratto API comune del repository (`docs/api-contract.md` nella root):

- `GET /api/health` per lo stato del servizio;
- CRUD completo in memoria su `/api/items` (3 item di esempio all'avvio);
- errori nel formato standard **Problem Details** (RFC 9457, `application/problem+json`);
- documentazione interattiva **Swagger UI** su `/docs`.

Architettura a layer (route → controller → service → repository), configurazione da variabili
d'ambiente validata all'avvio, log strutturati JSON, CORS configurabile, header di sicurezza,
graceful shutdown, test unitari e di integrazione con coverage, lint e formattazione, immagine Docker.

I tipi sono descritti con **JSDoc** (commenti `/** @param {string} id */`): l'editor li usa per
autocompletamento e controllo errori, e `npm run typecheck` li verifica, ma il codice resta JavaScript
puro, senza compilazione. Per la versione TypeScript c'è il template separato `typescript-backend-template`.

## 1. Stack e versioni

Versioni esatte usate e verificate per questa guida (novembre 2026):

| Componente                                       | Versione                  | A cosa serve                          |
| ------------------------------------------------ | ------------------------- | ------------------------------------- |
| Node.js                                          | 26.13.0 (LTS)             | runtime JavaScript                    |
| npm                                              | 11.x (incluso in Node 26) | gestore pacchetti                     |
| Express                                          | 5.3.0                     | framework HTTP                        |
| zod                                              | 4.6.7                     | validazione di input e configurazione |
| pino                                             | 10.4.0                    | logger strutturato JSON               |
| pino-http                                        | 11.0.0                    | log di ogni richiesta HTTP            |
| helmet                                           | 8.3.0                     | header HTTP di sicurezza              |
| cors                                             | 2.8.6                     | gestione CORS                         |
| swagger-ui-express                               | 5.0.1                     | Swagger UI su `/docs`                 |
| yaml                                             | 2.9.1                     | lettura di `openapi.yaml`             |
| node:test                                        | integrato in Node 26      | test runner                           |
| supertest                                        | 7.3.1                     | test di integrazione HTTP             |
| c8                                               | 12.0.0                    | coverage (report testo/HTML/lcov)     |
| ESLint                                           | 10.14.0 (flat config)     | linter                                |
| Prettier                                         | 3.9.10                    | formattazione                         |
| TypeScript (solo `tsc` per controllare il JSDoc) | 7.0.2                     | `npm run typecheck`                   |
| pino-pretty                                      | 13.2.0                    | log leggibili in sviluppo             |
| Immagine Docker                                  | `node:26.13.0-alpine3.24` | runtime del container                 |

**Scelte principali**

- **ESM** (`"type": "module"` in `package.json`): si usa `import`/`export`, lo standard JavaScript
  moderno, al posto di `require`. Ogni import locale deve avere l'estensione `.js`.
- **Express 5**: gli errori lanciati dentro handler `async` arrivano da soli all'error handler, quindi
  non servono `try/catch` o wrapper `asyncHandler` nei controller.
- **Test runner nativo `node:test`** invece di Jest/Vitest: zero dipendenze, nessuna configurazione,
  supporto ESM nativo (Jest con ESM richiede ancora flag sperimentali) e API simile (`describe`, `it`,
  `beforeEach`). La coverage usa **c8**, che legge la coverage nativa di V8 e produce report HTML/lcov
  e soglie minime senza i warning "experimental" di `--experimental-test-coverage`.
- **zod** per validare sia i body delle richieste sia le variabili d'ambiente, con un solo stile.
- **`node --env-file-if-exists=.env`** per leggere il file `.env`: funzionalità integrata in Node, niente `dotenv`.

## 2. Struttura delle cartelle

```text
nodejs-backend-template/
├── src/
│   ├── app.js                  # factory dell'app Express (testabile, non apre porte) + composizione dipendenze
│   ├── server.js               # avvio HTTP, graceful shutdown (SIGTERM/SIGINT), errori fatali
│   ├── config/
│   │   ├── env.js              # lettura e validazione (zod) delle variabili d'ambiente
│   │   └── logger.js           # creazione del logger pino
│   ├── routes/
│   │   ├── index.js            # router /api: monta i router delle risorse
│   │   ├── healthRoutes.js     # /api/health
│   │   ├── itemRoutes.js       # /api/items (validazione + controller)
│   │   └── docsRoutes.js       # /docs (Swagger UI) e /docs/openapi.json
│   ├── controllers/            # layer HTTP sottile: req/res -> service
│   ├── services/               # logica di business (nessuna conoscenza di HTTP)
│   ├── repositories/
│   │   ├── itemRepository.js   # "interfaccia" (typedef JSDoc) del repository
│   │   ├── inMemoryItemRepository.js # implementazione in memoria (Map)
│   │   └── seedItems.js        # i 3 item di esempio
│   ├── schemas/itemSchemas.js  # schemi zod (DTO di input) e tipi JSDoc Item/ItemInput
│   ├── middlewares/
│   │   ├── validate.js         # validazione generica con zod (body/params/query)
│   │   ├── notFound.js         # 404 per rotte inesistenti
│   │   └── errorHandler.js     # gestore centrale degli errori -> Problem Details
│   ├── utils/
│   │   ├── httpErrors.js       # HttpError, NotFoundError, ValidationError
│   │   ├── problemDetails.js   # invio di risposte application/problem+json
│   │   └── zodErrors.js        # errori zod -> { campo: [messaggi] }
│   └── docs/openapi.yaml       # specifica OpenAPI 3.1 (scritta a mano)
├── tests/
│   ├── helpers/testApp.js      # crea un'app di test con logger silenzioso
│   ├── unit/                   # service, repository, schemi, config, middleware
│   └── integration/            # tutti gli endpoint via HTTP con supertest
├── .env.example                # variabili d'ambiente di esempio
├── .c8rc.json                  # configurazione e soglie di coverage
├── eslint.config.js            # ESLint flat config
├── .prettierrc.json            # Prettier
├── jsconfig.json               # controllo dei tipi JSDoc (editor e npm run typecheck)
├── .nvmrc                      # versione di Node per nvm/fnm
├── Dockerfile / .dockerignore
└── package.json / package-lock.json
```

Il flusso di una richiesta: `pino-http` (log) → `helmet` → `cors` → `express.json()` → router
→ middleware `validate` → controller → service → repository. Qualsiasi errore lanciato finisce in
`errorHandler`, che risponde in formato Problem Details.

## 3. Prerequisiti e installazione dell'ambiente

Serve **Node.js 26 LTS** (npm è incluso). Docker è facoltativo. Pagina ufficiale dei download:
<https://nodejs.org/en/download>.

### Windows

- **Consigliato: fnm** (gestore di versioni, permette di avere più versioni di Node):
  ```powershell
  winget install Schniz.fnm
  # aggiungi a $PROFILE di PowerShell la riga seguente, poi riapri il terminale:
  # fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
  fnm install 26
  fnm use 26
  ```
  Node viene installato nella cartella dati di fnm (di solito `%APPDATA%\fnm`; il percorso esatto è nella variabile `FNM_DIR` mostrata da `fnm env`).
- **In alternativa: installer ufficiale** `.msi` da <https://nodejs.org/en/download> (scegli "LTS"),
  oppure `winget install OpenJS.NodeJS.LTS`. Viene installato in `C:\Program Files\nodejs`.
- Docker (facoltativo): Docker Desktop da <https://docs.docker.com/desktop/setup/install/windows-install/> (con WSL 2).

### macOS

- **Consigliato: fnm via Homebrew** (<https://brew.sh>):
  ```bash
  brew install fnm
  echo 'eval "$(fnm env --use-on-cd --shell zsh)"' >> ~/.zshrc && source ~/.zshrc
  fnm install 26 && fnm use 26
  ```
  Node viene installato nella cartella dati di fnm (percorso nella variabile `FNM_DIR` mostrata da `fnm env`).
- In alternativa: `brew install node@26` oppure l'installer `.pkg` ufficiale (installa in `/usr/local/bin/node`).
- Docker (facoltativo): Docker Desktop da <https://docs.docker.com/desktop/setup/install/mac-install/>.

### Linux (Ubuntu/Debian, Fedora, ...)

- **Consigliato: nvm** (<https://github.com/nvm-sh/nvm>) o fnm:
  ```bash
  # comando di installazione aggiornato (con la versione corrente) su https://github.com/nvm-sh/nvm#installing-and-updating
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
  source ~/.bashrc
  nvm install 26     # nella cartella del progetto basta "nvm use" (legge .nvmrc)
  ```
  Node viene installato in `~/.nvm/versions/node/`.
- In alternativa i pacchetti NodeSource (<https://github.com/nodesource/distributions>), ad es. su
  Ubuntu: `curl -fsSL https://deb.nodesource.com/setup_26.x | sudo -E bash - && sudo apt install -y nodejs`;
  su Fedora: `sudo dnf install nodejs` (verifica che la versione sia la 26). Installa in `/usr/bin/node`.
- Docker (facoltativo): Docker Engine da <https://docs.docker.com/engine/install/>.

### Verifica

```bash
node --version     # v26.x.x
npm --version      # 11.x.x
docker --version   # facoltativo
```

### Editor consigliato

[VS Code](https://code.visualstudio.com/) con le estensioni (proposte in automatico da `.vscode/extensions.json`):
ESLint (`dbaeumer.vscode-eslint`), Prettier (`esbenp.prettier-vscode`), EditorConfig.
`.vscode/settings.json` attiva formattazione al salvataggio e fix ESLint. Grazie a `jsconfig.json`
VS Code segnala gli errori di tipo JSDoc direttamente nei file `.js`.

## 4. Installazione delle dipendenze

```bash
cd nodejs-backend-template
npm ci            # installa le versioni esatte di package-lock.json (consigliato)
# oppure: npm install   (se aggiungi/aggiorni dipendenze; aggiorna il lockfile)
cp .env.example .env    # Windows PowerShell: Copy-Item .env.example .env
```

Il file `.env` è facoltativo: senza, valgono i default del contratto.

## 5. Comandi

| Comando                                   | Cosa fa                                                                                    |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev`                             | sviluppo: riavvio automatico a ogni modifica (`node --watch`) e log colorati (pino-pretty) |
| `npm start`                               | avvio "di produzione" (log JSON)                                                           |
| `npm test`                                | tutti i test (unit + integrazione) con `node:test`                                         |
| `npm run test:watch`                      | test in modalità watch                                                                     |
| `npm run coverage`                        | test + coverage; report in `coverage/index.html`, fallisce sotto le soglie di `.c8rc.json` |
| `npm run lint` / `npm run lint:fix`       | ESLint (zero warning ammessi) / correzione automatica                                      |
| `npm run format` / `npm run format:check` | Prettier: formatta / verifica                                                              |
| `npm run typecheck`                       | controlla i tipi JSDoc con `tsc` (nessun file generato)                                    |
| `npm run check`                           | lint + format:check + typecheck + test (da usare prima di un commit o in CI)               |

Non c'è uno step di **build**: JavaScript viene eseguito direttamente da Node.
**Anteprima produzione**: `NODE_ENV=production npm start` (PowerShell: `$env:NODE_ENV="production"; npm start`)
oppure l'immagine Docker (sezione 7).

Una volta avviato: <http://localhost:3000/api/health> e <http://localhost:3000/docs>.

## 6. Configurazione

Variabili d'ambiente (validate all'avvio in `src/config/env.js`: se una è sbagliata il processo si ferma
con un messaggio chiaro, ad es. `PORT: Invalid input: expected number, received NaN`).

| Variabile             | Default                                                                                  | Descrizione                                                       |
| --------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `PORT`                | `3000`                                                                                   | porta HTTP                                                        |
| `CORS_ORIGINS`        | porte dev/docker di tutti i frontend (`http://localhost:5173,...,http://localhost:8084`) | origini consentite separate da virgola; `*` = tutte               |
| `LOG_LEVEL`           | `info`                                                                                   | `debug`, `info`, `warn`, `error`                                  |
| `NODE_ENV`            | `development`                                                                            | `development`, `production`, `test`                               |
| `SHUTDOWN_TIMEOUT_MS` | `10000`                                                                                  | tempo massimo per chiudere le richieste in corso allo spegnimento |

Le variabili si impostano nel file `.env` (letto da `npm run dev`/`npm start`), nell'ambiente della shell
(che ha la precedenza sul file) oppure con `-e` in Docker. Ogni risposta ha l'header `X-Request-Id`
(riusato se il client lo invia) che compare anche nei log, utile per correlare richieste ed errori.

## 7. Docker

Immagine multi-stage su `node:26.13.0-alpine3.24`: solo dipendenze di produzione (`npm ci --omit=dev`),
utente non-root `node`, `HEALTHCHECK` su `/api/health`, porta **3000** nel container.

```bash
docker build -t nodejs-backend-template .
docker run --rm -p 3000:3000 nodejs-backend-template
# con variabili:
docker run --rm -p 3000:3000 -e LOG_LEVEL=debug -e CORS_ORIGINS=http://localhost:8083 nodejs-backend-template
docker ps            # la colonna STATUS mostra "(healthy)" dopo pochi secondi
```

Con il `docker-compose.yml` della root del repository (servizio `nodejs-backend-template`, porta host **8089**):

```bash
# dalla root del repository
docker compose up --build nodejs-backend-template
curl http://localhost:8089/api/health
```

Nei container dei frontend nginx inoltra `/api/` a `http://nodejs-backend-template:3000` (variabile `API_UPSTREAM`).
`docker stop` invia SIGTERM: il server chiude le connessioni in modo pulito e termina in meno di un secondo.

## 8. API disponibili

| Metodo   | Rotta                | Successo                                       | Errori       |
| -------- | -------------------- | ---------------------------------------------- | ------------ |
| `GET`    | `/api/health`        | `200` `{ status: "ok", service, timestamp }`   | -            |
| `GET`    | `/api/items`         | `200` array di `Item` ordinati per `createdAt` | -            |
| `GET`    | `/api/items/{id}`    | `200` `Item`                                   | `404`        |
| `POST`   | `/api/items`         | `201` `Item` + header `Location`               | `400`        |
| `PUT`    | `/api/items/{id}`    | `200` `Item` aggiornato                        | `400`, `404` |
| `DELETE` | `/api/items/{id}`    | `204` senza corpo                              | `404`        |
| `GET`    | `/docs`              | Swagger UI                                     | -            |
| `GET`    | `/docs/openapi.json` | specifica OpenAPI in JSON                      | -            |

`Item`: `{ id (UUID v4), name, description (string|null), price, createdAt, updatedAt }`.
Input (`POST`/`PUT`): `{ "name": 1-100 caratteri dopo trim, "description"?: max 500 o null, "price": >= 0 }`.
I campi extra (es. `id`, `createdAt`) vengono ignorati. `PUT` sostituisce l'intero item:
un `description` omesso diventa `null`.

Esempi:

```bash
curl http://localhost:3000/api/items
curl -i -X POST http://localhost:3000/api/items -H "Content-Type: application/json" \
  -d '{"name":"Desk","description":"Oak desk","price":120}'
curl -X PUT http://localhost:3000/api/items/7c9e6679-7425-40de-944b-e07fc1f90ae7 \
  -H "Content-Type: application/json" -d '{"name":"Keyboard","price":99}'
curl -i -X DELETE http://localhost:3000/api/items/7c9e6679-7425-40de-944b-e07fc1f90ae7
```

Errore di validazione (`400`, `Content-Type: application/problem+json`):

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

Altri casi: JSON malformato → `400` con `errors.body`; risorsa o rotta inesistente → `404` senza `errors`;
body oltre 100 kB → `413`; errore inatteso → `500` con messaggio generico (lo stack trace va solo nei log).

## 9. Come aggiungere una nuova risorsa (passo passo)

Esempio: risorsa `categories` su `/api/categories`. Conviene copiare i file di `items` e rinominarli.

1. **Schema** – `src/schemas/categorySchemas.js`: schema zod dell'input e typedef JSDoc della risorsa.
   ```js
   import { z } from 'zod';
   export const categoryInputSchema = z.object({
     name: z.string({ error: 'name is required' }).trim().min(1, 'name must not be empty').max(50),
   });
   /** @typedef {z.output<typeof categoryInputSchema>} CategoryInput */
   /** @typedef {{ id: string, name: string, createdAt: string, updatedAt: string }} Category */
   ```
2. **Repository** – `src/repositories/categoryRepository.js` (typedef dell'interfaccia) e
   `inMemoryCategoryRepository.js` (copia di `InMemoryItemRepository` con i tipi aggiornati).
3. **Service** – `src/services/categoryService.js`: classe che riceve il repository nel costruttore,
   genera id/date e lancia `NotFoundError` quando serve. Nessun `req`/`res` qui.
4. **Controller** – `src/controllers/categoryController.js`: `createCategoryController(categoryService)`
   che restituisce gli handler (`list`, `getById`, `create`, `update`, `remove`).
5. **Router** – `src/routes/categoryRoutes.js`:
   ```js
   router.post('/', validate(categoryInputSchema), categoryController.create);
   ```
   e in `src/routes/index.js` aggiungi `router.use('/categories', createCategoryRouter(categoryController));`
   (aggiungendo `categoryController` ai parametri di `createApiRouter`).
6. **Composizione** – in `src/app.js` crea repository → service → controller e passalo a `createApiRouter`.
   Se vuoi poterlo sostituire nei test, aggiungi un'opzione `categoryRepository` a `createApp`.
7. **OpenAPI** – aggiungi path e schemi in `src/docs/openapi.yaml` (si vedono subito su `/docs`).
8. **Test** – `tests/unit/categoryService.test.js` e `tests/integration/categories.test.js`
   (usa `buildTestApp()` di `tests/helpers/testApp.js`).
9. Verifica tutto con `npm run check` e `npm run coverage`.

**Passare a un database vero**: scrivi una classe (es. `PostgresItemRepository`) con gli stessi metodi
di `ItemRepository` (`findAll`, `findById`, `create`, `update`, `delete`, tutti `async`) e passala a
`createApp({ config, logger, itemRepository })` in `src/server.js`. Service e controller non cambiano.

## 10. Problemi comuni

- **`SyntaxError: Cannot use import statement outside a module` / `ERR_MODULE_NOT_FOUND`**: il progetto è ESM;
  negli import locali serve l'estensione (`'./app.js'`, non `'./app'`). Usa Node 26 (`node --version`).
- **`bad option: --env-file-if-exists`** o errori strani all'avvio: versione di Node troppo vecchia, installa la 26 (`nvm use`).
- **`EADDRINUSE: address already in use :::3000`**: la porta è occupata. Avvia con un'altra porta
  (`PORT=3005 npm run dev`) oppure trova il processo: `lsof -i :3000` (macOS/Linux), `netstat -ano | findstr :3000` (Windows).
- **`Invalid configuration: ...` all'avvio**: una variabile d'ambiente ha un valore non valido; correggi `.env`.
- **Errore CORS nel browser**: l'origine del frontend non è in `CORS_ORIGINS` (deve combaciare esattamente,
  schema e porta inclusi, es. `http://localhost:5173`).
- **`POST` risponde 400 con `name is required` anche se mandi il JSON**: manca l'header `Content-Type: application/json`.
- **Su Windows `cp`/`NODE_ENV=...` non funzionano**: in PowerShell usa `Copy-Item` e `$env:NODE_ENV="production"`.
- **`docker build` fallisce con `SELF_SIGNED_CERT_IN_CHAIN`** (rete aziendale con proxy HTTPS che ispeziona il traffico):
  passa il certificato della CA aziendale come secret di build, non resta nell'immagine:
  `docker build --secret id=npm_ca,src=/percorso/ca-aziendale.pem -t nodejs-backend-template .`
- **`npm audit` segnala vulnerabilità moderate**: alla data di questa guida riguardano solo dipendenze di sviluppo
  (glob/minimatch usati da ESLint e c8), non l'immagine di produzione: `npm audit --omit=dev` → 0 vulnerabilità.
- **Warning `install-scripts ... @scarf/scarf`** durante `npm install`: è uno script di telemetria di
  swagger-ui; npm 11 non lo esegue e non serve. Si può ignorare.

## 11. Comandi utili extra

```bash
npm outdated                         # dipendenze con versioni più recenti
npm audit --omit=dev                 # vulnerabilità nelle sole dipendenze di produzione
node --test tests/unit/itemService.test.js                    # un solo file di test
node --test --test-name-pattern="creates an item" "tests/**/*.test.js"   # test per nome
LOG_LEVEL=debug npm run dev          # log più dettagliati
npm start | npx pino-pretty          # log leggibili anche con npm start
docker logs -f <container>           # log del container
docker inspect --format '{{json .State.Health}}' <container>   # stato dell'healthcheck
```
