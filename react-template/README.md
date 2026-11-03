# React Template

Template frontend **React + TypeScript + Vite** pronto da copiare: routing con pagine lazy,
data fetching con cache, form con validazione, client API tipizzato, una piccola libreria di
componenti UI accessibili scritti a mano e un'immagine Docker nginx pronta per la produzione.

Consuma le API comuni descritte in [`docs/api-contract.md`](../docs/api-contract.md)
(`/api/health` e CRUD `/api/items`), quindi funziona con **qualsiasi** backend del repository.

## Indice

1. [Stack e versioni](#1-stack-e-versioni)
2. [Struttura delle cartelle](#2-struttura-delle-cartelle)
3. [Prerequisiti e installazione dell'ambiente](#3-prerequisiti-e-installazione-dellambiente)
4. [Installazione delle dipendenze](#4-installazione-delle-dipendenze)
5. [Comandi](#5-comandi)
6. [Configurazione](#6-configurazione)
7. [Docker](#7-docker)
8. [Pagine e API usate](#8-pagine-e-api-usate)
9. [Come aggiungere una nuova risorsa/pagina](#9-come-aggiungere-una-nuova-risorsapagina)
10. [Problemi comuni](#10-problemi-comuni)
11. [Comandi utili extra](#11-comandi-utili-extra)

---

## 1. Stack e versioni

Versioni esatte usate per questa guida (verificate su npm / nodejs.org a novembre 2026).
In `package.json` le versioni sono fissate senza `^`: gli aggiornamenti sono sempre una scelta esplicita.

| Componente                   | Versione                                                    | A cosa serve                                                   |
| ---------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- |
| Node.js (LTS "Lithium")      | **26.13.0**                                                 | runtime per dev server, build e test (minimo supportato 22.22) |
| npm                          | 11.x (con Node 26)                                          | package manager                                                |
| React / React DOM            | 19.3.1                                                      | libreria UI                                                    |
| TypeScript                   | **6.0.3**                                                   | linguaggio tipizzato (vedi nota sotto)                         |
| Vite                         | 8.3.5                                                       | dev server e bundler (Rolldown)                                |
| @vitejs/plugin-react         | 6.2.1                                                       | supporto React/JSX e Fast Refresh in Vite                      |
| React Router                 | 8.5.1                                                       | routing con route lazy (`react-router`)                        |
| TanStack Query               | 5.105.3                                                     | cache e stato dei dati del server                              |
| React Hook Form              | 7.91.0                                                      | gestione dei form                                              |
| Zod                          | 4.6.7                                                       | schemi di validazione                                          |
| @hookform/resolvers          | 7.0.2                                                       | collega Zod a React Hook Form                                  |
| Vitest / @vitest/coverage-v8 | 5.1.0                                                       | test runner e coverage                                         |
| jsdom                        | 30.1.3                                                      | DOM simulato per i test                                        |
| Testing Library              | react 16.3.3, dom 10.4.2, user-event 14.6.8, jest-dom 7.0.1 | test dei componenti                                            |
| ESLint                       | 10.14.0                                                     | linter (flat config)                                           |
| typescript-eslint            | 8.72.1                                                      | regole ESLint per TypeScript                                   |
| eslint-plugin-react-hooks    | 7.1.1                                                       | regole degli hook (+ regole React Compiler)                    |
| eslint-plugin-react-refresh  | 0.5.7                                                       | controlli per il Fast Refresh                                  |
| Prettier                     | 3.9.10                                                      | formatter                                                      |
| nginx (immagine Docker)      | 1.30.6-alpine3.24                                           | server statico + reverse proxy in produzione                   |
| node (immagine Docker build) | 26.13.0-alpine3.24                                          | stage di build                                                 |

> **Perche' TypeScript 6 e non 7?** TypeScript 7.0 (il nuovo compilatore nativo scritto in Go)
> e' uscito da poco, ma `typescript-eslint` 8.72 (l'ultima versione) supporta ufficialmente solo
> `typescript >=4.8.4 <6.1.0`: con TS 7 il lint con informazioni di tipo non e' supportato.
> Usiamo quindi l'ultima 6.x (6.0.3), pienamente compatibile con tutto l'ecosistema.
> Quando typescript-eslint supportera' TS 7 basta `npm install -D -E typescript@7` e verificare
> `npm run lint && npm run build`.
>
> **Novita' delle major usate, gia' gestite nel template:**
>
> - TypeScript 6: `types` non include piu' automaticamente tutti i pacchetti `@types`, per questo in
>   `tsconfig.app.json` sono elencati esplicitamente (`vite/client`, `vitest/globals`, jest-dom).
> - Vite 8 usa Rolldown come bundler e richiede `@vitejs/plugin-react` 6.
> - React Router 8 si importa da un unico pacchetto `react-router` (niente `react-router-dom`).
> - Zod 4: API `z.email()`, opzione `error` al posto di `message`/`errorMap`.
> - ESLint 10 supporta solo la flat config (`eslint.config.js`).
> - In `package.json` c'e' un `overrides` di `minimatch` a 11.0.4 per chiudere un advisory
>   moderato (DoS) presente nella versione richiesta da ESLint; `npm audit` e' pulito.

**Perche' queste librerie:** React Router e TanStack Query sono gli standard de facto per routing
e dati remoti (cache, loading/error, invalidazione dopo le mutation, polling); React Hook Form +
Zod danno validazione tipizzata con pochissimi re-render, e lo stesso schema produce i tipi
TypeScript del form. I componenti UI invece sono scritti a mano (niente librerie di componenti)
per restare leggeri e facili da personalizzare.

## 2. Struttura delle cartelle

```text
react-template/
├── Dockerfile                    # build multi-stage: Node (build) -> nginx (runtime)
├── nginx/default.conf.template   # config nginx: SPA fallback, proxy /api, gzip, cache
├── index.html                    # pagina HTML unica della SPA
├── public/                       # file statici copiati cosi' come sono (favicon)
├── vite.config.ts                # Vite (porta 5173, proxy /api, alias @) + Vitest
├── eslint.config.js              # ESLint flat config
├── .prettierrc.json              # Prettier
├── tsconfig*.json                # TypeScript (app / file Node)
├── .env.example                  # variabili VITE_ documentate
└── src/
    ├── main.tsx                  # bootstrap: monta <App /> e gli stili globali
    ├── vite-env.d.ts             # tipi delle variabili import.meta.env
    ├── app/
    │   ├── App.tsx               # provider globali (QueryClient, Toast) + RouterProvider
    │   ├── routes.ts             # tabella delle route (pagine lazy)
    │   └── queryClient.ts        # configurazione della cache TanStack Query
    ├── config/env.ts             # lettura centralizzata delle variabili VITE_
    ├── api/
    │   ├── httpClient.ts         # client HTTP unico (fetch) + ApiError
    │   └── problemDetails.ts     # tipi Problem Details (RFC 9457)
    ├── features/                 # una cartella per dominio/risorsa
    │   ├── health/               # healthApi + useHealth + BackendStatus
    │   └── items/                # itemTypes, itemsApi, itemSchema (Zod), useItems, components/
    ├── components/
    │   ├── ui/                   # componenti UI riusabili (Button, Input, Modal, ...) + index.ts
    │   ├── layout/               # AppLayout, Navbar, navLinks (voci di menu)
    │   ├── PageHeader.tsx
    │   └── PageLoader.tsx
    ├── pages/                    # una pagina per route (Home, Components, Items, 404, errore)
    │   └── showcase/             # sezioni della pagina Componenti (esempi + codice)
    ├── lib/                      # helper puri: format.ts, formErrors.ts
    ├── styles/
    │   ├── tokens.css            # DESIGN TOKEN: colori, spaziature, font (unico file)
    │   └── global.css            # reset e tipografia di base
    └── test/                     # setup di Vitest e helper renderWithProviders
```

**Flusso dei dati (dall'alto in basso):**
`pagina` → `hook di stato` (es. `useItems`, TanStack Query) → `servizio API` (`itemsApi`) →
`httpClient` → `fetch('/api/...')`. Le pagine non chiamano mai `fetch` direttamente e i
componenti in `components/ui` sono solo presentazionali (nessuna chiamata HTTP).

I file `*.test.ts(x)` stanno accanto al codice che testano.

## 3. Prerequisiti e installazione dell'ambiente

Serve solo **Node.js 26 LTS** (npm e' incluso). Docker e' opzionale (solo per l'immagine di produzione).

### Node.js

Download ufficiale: <https://nodejs.org/en/download> (scegli la versione "LTS").
Consigliato un **version manager**, che permette di avere piu' versioni e cambiarle per progetto:
nel template c'e' un file `.nvmrc` con `26`.

**Windows**

- Con [fnm](https://github.com/Schniz/fnm) (consigliato):
  ```powershell
  winget install Schniz.fnm
  # aggiungi a $PROFILE (PowerShell):  fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
  fnm install 26
  fnm use 26
  ```
- Oppure installer ufficiale `.msi` da nodejs.org, o `winget install OpenJS.NodeJS.LTS`.
  Si installa in `C:\Program Files\nodejs\` ed e' aggiunto al `PATH` automaticamente.

**macOS**

- Con Homebrew + fnm:
  ```bash
  brew install fnm
  echo 'eval "$(fnm env --use-on-cd --shell zsh)"' >> ~/.zshrc && source ~/.zshrc
  fnm install 26 && fnm use 26
  ```
- Oppure `brew install node@26` (in `/opt/homebrew/opt/node@26`) o l'installer `.pkg` ufficiale
  (in `/usr/local/bin/node`).

**Linux**

- Con [nvm](https://github.com/nvm-sh/nvm):
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  source ~/.bashrc
  nvm install 26 && nvm use 26     # nella cartella del progetto basta "nvm use" (legge .nvmrc)
  ```
  nvm installa Node in `~/.nvm/versions/node/`.
- Oppure i pacchetti NodeSource per apt/dnf: <https://github.com/nodesource/distributions>.

**Verifica:**

```bash
node --version   # v26.x.x
npm --version    # 11.x
```

### Docker (opzionale)

- Windows / macOS: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  (`winget install Docker.DockerDesktop` / `brew install --cask docker`).
- Linux: Docker Engine, <https://docs.docker.com/engine/install/>.
- Verifica: `docker --version` e `docker compose version`.

### Editor consigliato

[Visual Studio Code](https://code.visualstudio.com/) con le estensioni (suggerite automaticamente
da `.vscode/extensions.json`):

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`) — attiva "Format on Save".

## 4. Installazione delle dipendenze

```bash
cd react-template
npm ci          # installa esattamente le versioni di package-lock.json (consigliato)
# oppure
npm install     # se modifichi le dipendenze (aggiorna il lockfile)
```

## 5. Comandi

| Comando                 | Cosa fa                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| `npm run dev`           | dev server su <http://localhost:5173> con hot reload e proxy `/api`     |
| `npm run build`         | type check (`tsc -b`) + build di produzione in `dist/`                  |
| `npm run preview`       | serve la build di `dist/` su <http://localhost:4173> (con proxy `/api`) |
| `npm run typecheck`     | solo controllo dei tipi                                                 |
| `npm test`              | esegue tutti i test una volta                                           |
| `npm run test:watch`    | test in modalita' watch                                                 |
| `npm run test:coverage` | test + report di coverage in `coverage/` (apri `coverage/index.html`)   |
| `npm run lint`          | ESLint (fallisce anche con un solo warning)                             |
| `npm run lint:fix`      | ESLint con correzione automatica                                        |
| `npm run format`        | formatta tutto con Prettier                                             |
| `npm run format:check`  | verifica la formattazione (utile in CI)                                 |

Per sviluppare serve un backend in ascolto su `http://localhost:3000` (es. `nodejs-backend-template`).
Senza backend l'app parte lo stesso: la Home mostra "Offline" e la pagina Items un errore con "Retry".

## 6. Configurazione

### Variabili `VITE_` (lette dal codice del browser)

Copia `.env.example` in `.env.local` e modifica i valori. Le variabili con prefisso `VITE_`
sono **incluse nel bundle in fase di build**: sono pubbliche, non metterci segreti.
Sono lette in un solo punto, `src/config/env.ts`, e tipizzate in `src/vite-env.d.ts`.

| Variabile           | Default          | Significato                                                    |
| ------------------- | ---------------- | -------------------------------------------------------------- |
| `VITE_APP_TITLE`    | `React Template` | titolo nella navbar e nella scheda del browser                 |
| `VITE_API_BASE_URL` | `/api`           | prefisso delle chiamate API (lascia `/api` per usare il proxy) |

### Variabili del dev server (Node, non finiscono nel bundle)

| Variabile          | Default                 | Significato                                       |
| ------------------ | ----------------------- | ------------------------------------------------- |
| `API_PROXY_TARGET` | `http://localhost:3000` | backend a cui Vite inoltra `/api` (dev e preview) |

`vite.config.ts` la legge da `process.env`, quindi va impostata nella shell:

```bash
# Linux / macOS
API_PROXY_TARGET=http://localhost:8080 npm run dev
# Windows PowerShell
$env:API_PROXY_TARGET="http://localhost:8080"; npm run dev
# Windows cmd
set API_PROXY_TARGET=http://localhost:8080 && npm run dev
```

Porte dei backend (dal contratto): Java 8080, Python 8000, .NET 5080, TypeScript 3001, Node.js 3000.

### Personalizzare l'aspetto

Tutti i colori, spaziature, font, raggi e ombre sono variabili CSS in `src/styles/tokens.css`.
Il tema scuro segue automaticamente la preferenza del sistema (`prefers-color-scheme`).
Locale e valuta per prezzi e date sono in `src/lib/format.ts`.

## 7. Docker

L'immagine e' multi-stage: Node 26 compila l'app, poi **nginx 1.30 alpine** (utente non-root
`nginx`) serve i file statici. Porta interna del container: **80**.

nginx usa `nginx/default.conf.template`: all'avvio sostituisce `${API_UPSTREAM}` e

- fa **fallback SPA** (`try_files ... /index.html`), cosi' `/items` ricaricato funziona;
- fa **reverse proxy** di `/api/` verso `API_UPSTREAM`, risolto a runtime con il DNS di Docker:
  il container parte anche senza backend (l'app mostra "Offline", le API rispondono 502);
- abilita **gzip**, cache lunga per `/assets/*` (nomi con hash) e `no-cache` per `index.html`;
- espone `/healthz` per l'`HEALTHCHECK`.

| Variabile (runtime) | Default                               | Significato                                                          |
| ------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| `API_UPSTREAM`      | `http://nodejs-backend-template:3000` | backend verso cui girare `/api/` (schema + host + porta, senza path) |

| Build arg           | Default          |
| ------------------- | ---------------- |
| `VITE_APP_TITLE`    | `React Template` |
| `VITE_API_BASE_URL` | `/api`           |

```bash
# Build
docker build -t react-template .
docker build -t react-template --build-arg VITE_APP_TITLE="My App" .

# Run (http://localhost:8083)
docker run -d --name react-template -p 8083:80 react-template

# Run collegato a un backend su un'altra rete/host
docker run -d -p 8083:80 -e API_UPSTREAM=http://host.docker.internal:3000 react-template

# Verifica
curl http://localhost:8083/healthz            # ok
docker inspect --format '{{.State.Health.Status}}' react-template   # healthy

# Stop
docker rm -f react-template
```

> Nota: il resolver `127.0.0.11` e' il DNS interno di Docker, disponibile sulle reti
> definite dall'utente (come quella di docker compose). Su `docker run` "semplice" (rete bridge
> di default) i nomi dei container non si risolvono: usa compose, una rete creata con
> `docker network create`, oppure un `API_UPSTREAM` con IP/host raggiungibile.

### Con il docker-compose della root

Il servizio si chiama `react-template` ed e' esposto sulla porta host **8083**:

```bash
# dalla root del repository
docker compose up --build react-template nodejs-backend-template
# apri http://localhost:8083
```

Per collegarlo a un altro backend cambia `API_UPSTREAM` nel `docker-compose.yml` della root
(es. `http://python-backend-template:8000`).

## 8. Pagine e API usate

| Route         | Pagina           | Descrizione                                                                             |
| ------------- | ---------------- | --------------------------------------------------------------------------------------- |
| `/`           | `HomePage`       | presentazione + stato backend (pallino verde Online / rosso Offline, polling ogni 15 s) |
| `/components` | `ComponentsPage` | showcase dei componenti con demo dal vivo e codice copiabile                            |
| `/items`      | `ItemsPage`      | CRUD completo: lista, crea, modifica, elimina, errori di validazione sui campi          |
| `*`           | `NotFoundPage`   | pagina 404                                                                              |

Componenti in `src/components/ui` (importabili da `@/components/ui`):
`Button`, `Input`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Textarea`, `Card`, `Alert`,
`ToastProvider`/`useToast`, `Modal`, `Tabs`, `Table`, `Badge`, `Spinner`.
Accessibilita': label collegate, `aria-invalid`/`aria-describedby` sugli errori, focus visibile da
tastiera, `Modal` su `<dialog>` nativo (focus trap ed Esc), `Tabs` con frecce/Home/End,
`Switch` con `role="switch"`, toast in una regione `aria-live`, link "Skip to content".

API chiamate (contratto comune): `GET /api/health`, `GET/POST /api/items`,
`GET/PUT/DELETE /api/items/{id}`. Gli errori `application/problem+json` diventano `ApiError`
(`src/api/httpClient.ts`); i 400 con `errors` vengono mostrati sotto i campi del form
(`src/lib/formErrors.ts`).

## 9. Come aggiungere una nuova risorsa/pagina

Esempio: una risorsa `products` con pagina `/products`. Copia la struttura di `features/items`.

1. **Tipi (DTO)** — `src/features/products/productTypes.ts`:
   ```ts
   export interface Product {
     id: string;
     title: string;
     createdAt: string;
     updatedAt: string;
   }
   export interface ProductInput {
     title: string;
   }
   ```
2. **Servizio API** — `src/features/products/productsApi.ts` (usa sempre `http`):
   ```ts
   import { http } from '@/api/httpClient';
   import type { Product, ProductInput } from './productTypes';

   export const productsApi = {
     list: (signal?: AbortSignal) => http.get<Product[]>('/products', signal),
     create: (input: ProductInput) => http.post<Product>('/products', input),
   };
   ```
3. **Hook di stato** — `src/features/products/useProducts.ts`:
   ```ts
   export const productsQueryKey = ['products'] as const;
   export function useProducts() {
     return useQuery({
       queryKey: productsQueryKey,
       queryFn: ({ signal }) => productsApi.list(signal),
     });
   }
   export function useCreateProduct() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: productsApi.create,
       onSuccess: () => queryClient.invalidateQueries({ queryKey: productsQueryKey }),
     });
   }
   ```
4. **Schema del form** (se serve) — `productSchema.ts` con Zod, come `itemSchema.ts`; il form
   usa `useForm({ resolver: zodResolver(schema) })` e `applyServerErrors` nel `catch`.
5. **Pagina** — `src/pages/ProductsPage.tsx` che usa gli hook e i componenti di `@/components/ui`
   (export con nome: `export function ProductsPage()`).
6. **Route** — in `src/app/routes.ts` aggiungi a `children`, prima della route `*`:
   ```ts
   {
     path: 'products',
     lazy: async () => ({ Component: (await import('@/pages/ProductsPage')).ProductsPage }),
   },
   ```
7. **Menu** — in `src/components/layout/navLinks.ts` aggiungi `{ to: '/products', label: 'Products' }`.
8. **Test** — `ProductsPage.test.tsx` con `renderWithProviders` e `fetch` mockato
   (vedi `ItemsPage.test.tsx`), piu' un test dello schema.
9. Verifica: `npm run lint && npm test && npm run build`.

**Nuovo componente UI:** crea `src/components/ui/MyThing.tsx` + `MyThing.module.css` usando solo
variabili di `tokens.css`, esportalo da `src/components/ui/index.ts` e aggiungi un esempio in
`src/pages/showcase/` (e una riga in `SECTIONS` di `ComponentsPage.tsx`).

## 10. Problemi comuni

| Problema                                                            | Soluzione                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home "Offline" in sviluppo                                          | Il backend non e' avviato su `localhost:3000` o e' su un'altra porta: avvialo o usa `API_PROXY_TARGET`. Nel terminale di Vite compare `http proxy error`.                                                                                                                             |
| `Port 5173 is already in use`                                       | `strictPort` e' attivo: chiudi l'altro processo (trovalo con `lsof -i :5173` su Linux/macOS o `netstat -ano                                                                                                                                                                           | findstr 5173`su Windows) o avvia con`npm run dev -- --port 5174` (ricorda che il CORS dei backend e' configurato per 5173). |
| `npm ci` fallisce con `EBADENGINE` o errori strani                  | Versione di Node troppo vecchia: `node --version` deve essere >= 22.22 (consigliato 26).                                                                                                                                                                                              |
| `Fast refresh only works when a file only exports components`       | Un file `.tsx` esporta anche funzioni/costanti: spostale in un file `.ts` separato.                                                                                                                                                                                                   |
| Le modifiche a `.env.local` non hanno effetto                       | Riavvia `npm run dev`; in Docker le `VITE_` vanno passate con `--build-arg` (sono fissate in build).                                                                                                                                                                                  |
| Ricaricando `/items` in produzione ottengo 404                      | Serve il fallback SPA: usa la config nginx inclusa (`try_files ... /index.html`).                                                                                                                                                                                                     |
| In Docker le API rispondono 502/504                                 | Il backend non e' raggiungibile da `API_UPSTREAM`: controlla nome del servizio, porta e che i container siano sulla stessa rete (compose).                                                                                                                                            |
| nginx: `socket() [::]:80 failed (97: Address family not supported)` | Host senza IPv6: la config inclusa ascolta solo su IPv4 proprio per questo.                                                                                                                                                                                                           |
| `npm ci` nel build Docker: `SELF_SIGNED_CERT_IN_CHAIN`              | Sei dietro un proxy che sostituisce i certificati TLS: costruisci da una copia locale del Dockerfile che, solo nello stage di build, copia il certificato della CA e imposta `ENV NODE_EXTRA_CA_CERTS=/percorso/ca.crt` prima di `npm ci`. L'immagine finale (nginx) non lo contiene. |
| Lint lento la prima volta                                           | ESLint usa le informazioni di tipo (`projectService`): e' normale, le esecuzioni successive sono piu' rapide.                                                                                                                                                                         |

## 11. Comandi utili extra

```bash
npx vitest src/pages/ItemsPage.test.tsx      # un solo file di test
npx vitest -t "creates an item"              # test per nome
npx vite --host                              # espone il dev server in LAN (test da smartphone)
npm outdated                                 # dipendenze con versioni piu' nuove
npm view <pacchetto> version                 # ultima versione pubblicata
npm install -E <pacchetto>@<versione>        # installa fissando la versione esatta
npx vite build --mode staging                # build con .env.staging
docker build --no-cache -t react-template .  # rebuild completo dell'immagine
docker logs -f react-template                # log di nginx
```
