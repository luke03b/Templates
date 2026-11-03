# Templates

Raccolta di template base, pronti da copiare, per i principali stack **frontend** e **backend**.
Ogni template è un progetto completo e funzionante: codice commentato, test, lint, Dockerfile e un
README con tutto quello che serve per installare l'ambiente su Windows, macOS e Linux.

Tutti i template parlano la **stessa API** (vedi [docs/api-contract.md](docs/api-contract.md)):
qualsiasi frontend funziona con qualsiasi backend, basta cambiare l'indirizzo del backend.

## Template disponibili

### Frontend

| Template | Stack | Porta dev | Porta Docker (host) |
|----------|-------|-----------|---------------------|
| [flutter-template](flutter-template) | Flutter (Dart), Material 3, go_router | 5300 | 8081 |
| [angular-template](angular-template) | Angular 22, Angular Material, Vitest | 4200 | 8082 |
| [react-template](react-template) | React 19, Vite 8, React Router, TanStack Query | 5173 | 8083 |
| [csharp-frontend-template](csharp-frontend-template) | C# con Blazor WebAssembly (.NET 10) | 5200 | 8084 |

Ogni frontend contiene:

- **Home** con indicatore dello stato del backend (chiama `GET /api/health`);
- **Componenti**: pagina vetrina con i componenti principali (bottoni, form, card, alert, toast,
  modal, tab, tabelle, badge, spinner, navigazione) e il codice da copiare;
- **Items**: CRUD completo contro `/api/items`, con gestione di caricamento ed errori di validazione;
- pagina **404**, layout responsive e design token in un unico file.

### Backend

| Template | Stack | Porta dev | Porta Docker (host) |
|----------|-------|-----------|---------------------|
| [java-backend-template](java-backend-template) | Java 25, Spring Boot 4.1, Maven | 8080 | 8085 |
| [python-backend-template](python-backend-template) | Python 3.14, FastAPI, uv/pip | 8000 | 8086 |
| [dotnet-backend-template](dotnet-backend-template) | .NET 10, ASP.NET Core Minimal API | 5080 | 8087 |
| [typescript-backend-template](typescript-backend-template) | Node 26 + TypeScript, Fastify 5, Vite, Vitest | 3001 | 8088 |
| [nodejs-backend-template](nodejs-backend-template) | Node 26 (JavaScript), Express 5 | 3000 | 8089 |

Ogni backend contiene:

- `GET /api/health` e un CRUD di esempio in memoria su `/api/items` (nessun database);
- architettura a layer (controller/route, service, repository dietro un'interfaccia, DTO);
- validazione ed errori nel formato standard **Problem Details**;
- configurazione da variabili d'ambiente (`.env.example`), CORS, logging strutturato;
- documentazione **OpenAPI/Swagger** interattiva;
- test unitari e di integrazione su tutti gli endpoint.

Le versioni esatte di runtime, framework e librerie sono nella tabella in cima al README di ogni template.

## Struttura del repository

```text
.
├── <nome>-template/       # un progetto indipendente per ogni stack, con il suo README
├── docs/api-contract.md   # contratto API comune a tutti i template
├── docker-compose.yml     # avvia tutti i template insieme
├── .github/workflows/     # CI: lint, test, build e Docker build di ogni template
├── .agents/skills/        # linee guida di stile per gli agenti AI (una per linguaggio)
└── PromptVetrina          # prompt di esempio per generare un sito vetrina dai template
```

## Come usare un template

1. Copia la cartella del template che ti serve in un nuovo repository (o usala direttamente).
2. Apri il `README.md` del template e installa l'ambiente indicato.
3. Installa le dipendenze, lancia i test e avvia il progetto con i comandi del README.

Per provare un frontend con un backend in locale (senza Docker) avvia il backend Node.js
(`nodejs-backend-template`, porta 3000): i dev server dei frontend fanno già da proxy verso
`http://localhost:3000`. Per usare un altro backend imposta `API_PROXY_TARGET`
(o l'URL base indicato nel README del frontend).

## Come eseguire con Docker

Serve [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) oppure
Docker Engine con il plugin Compose (Linux). Dalla root del repository:

```bash
# build e avvio di tutti i template
docker compose up --build

# solo alcuni servizi, ad esempio React + backend Node.js
docker compose up --build react-template nodejs-backend-template

# in background, poi log di un servizio
docker compose up --build -d
docker compose logs -f python-backend-template

# ferma e rimuove i container
docker compose down
```

Poi apri ad esempio <http://localhost:8083> (React) o <http://localhost:8086/docs> (Swagger del backend Python).

Nel container ogni frontend è servito da nginx, che inoltra le chiamate `/api/` al backend indicato
dalla variabile `API_UPSTREAM` (default `http://nodejs-backend-template:3000`). Per collegare i
frontend a un altro backend cambia `API_UPSTREAM` in `docker-compose.yml`, per esempio
`http://python-backend-template:8000`. I nomi e le porte interne dei backend sono in
[docs/api-contract.md](docs/api-contract.md#porte).

Ogni template si può anche costruire e avviare da solo: i comandi `docker build` / `docker run`
sono nel suo README.

## Integrazione continua

Il workflow [.github/workflows/ci.yml](.github/workflows/ci.yml) parte a ogni push su `main` e su
ogni pull request. Per ogni template modificato esegue format check, lint, test e build, e verifica
che l'immagine Docker si costruisca.

## Linee guida per gli agenti AI

La cartella `.agents/skills` contiene le regole di stile per linguaggio (Angular, React, Flutter,
C#/Blazor, .NET, Java, Python, Node.js, TypeScript) più quelle generali di progetto, frontend e
backend. Il file `PromptVetrina` è un prompt pronto per generare una landing page partendo da un
template frontend e uno backend.
