# Contratto API comune

Tutti i template **backend** espongono esattamente le stesse API, e tutti i template
**frontend** le consumano. In questo modo qualsiasi frontend funziona con qualsiasi
backend senza modifiche al codice: basta cambiare l'indirizzo del backend.

## Convenzioni generali

- Prefisso di tutte le rotte: `/api`.
- Formato: JSON (`application/json`), nomi dei campi in `camelCase`.
- Date in formato ISO 8601 UTC (es. `2026-11-03T18:00:00Z`).
- Gli errori usano il formato standard **Problem Details** (RFC 9457) con
  `Content-Type: application/problem+json`.
- Nessun database: i dati vivono in memoria (repository in-memory) e si azzerano al riavvio.
  Il repository è dietro un'interfaccia, così si può sostituire con un database vero.

## Endpoint

### `GET /api/health`

Stato del servizio. Risponde sempre `200` se il processo è vivo.

```json
{
  "status": "ok",
  "service": "python-backend-template",
  "timestamp": "2026-11-03T18:00:00Z"
}
```

### Risorsa di esempio `items` (CRUD in memoria)

Modello `Item`:

| Campo         | Tipo              | Regole                                   |
|---------------|-------------------|------------------------------------------|
| `id`          | string (UUID v4)  | generato dal server                      |
| `name`        | string            | obbligatorio, 1-100 caratteri (trim)     |
| `description` | string \| null    | opzionale, massimo 500 caratteri         |
| `price`       | number            | obbligatorio, `>= 0`                     |
| `createdAt`   | string (ISO 8601) | generato dal server                      |
| `updatedAt`   | string (ISO 8601) | generato dal server, aggiornato su PUT   |

Corpo di input per creazione/aggiornamento (`ItemInput`): `{ "name", "description"?, "price" }`.

| Metodo   | Rotta              | Successo                                   | Errori        |
|----------|--------------------|--------------------------------------------|---------------|
| `GET`    | `/api/items`       | `200` array di `Item` (ordinati per `createdAt`) | -       |
| `GET`    | `/api/items/{id}`  | `200` `Item`                               | `404`         |
| `POST`   | `/api/items`       | `201` `Item` + header `Location`           | `400`         |
| `PUT`    | `/api/items/{id}`  | `200` `Item` aggiornato                    | `400`, `404`  |
| `DELETE` | `/api/items/{id}`  | `204` senza corpo                          | `404`         |

All'avvio il repository contiene 3 item di esempio, così i frontend mostrano subito dei dati.

### Formato degli errori

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

- `400` validazione: `errors` è un oggetto `campo -> lista di messaggi`.
- `404` risorsa non trovata: niente `errors`.
- `500` errore inatteso: messaggio generico, **mai** stack trace; l'errore completo va nei log.

## Configurazione (variabili d'ambiente)

| Variabile      | Significato                                         | Default                         |
|----------------|-----------------------------------------------------|---------------------------------|
| `PORT`         | porta HTTP del backend                              | vedi tabella porte              |
| `CORS_ORIGINS` | origini consentite, separate da virgola             | tutte le porte dev/docker dei frontend (sotto) |
| `LOG_LEVEL`    | livello di log (`debug`, `info`, `warn`, `error`)   | `info`                          |

Ogni backend ha un file `.env.example` da copiare in `.env`.

Default di `CORS_ORIGINS`:
`http://localhost:5173,http://localhost:4200,http://localhost:5200,http://localhost:5300,http://localhost:8081,http://localhost:8082,http://localhost:8083,http://localhost:8084`

Documentazione interattiva OpenAPI/Swagger: disponibile su ogni backend (il percorso esatto è nel README del template).

## Porte

| Template                      | Ruolo    | Porta in sviluppo locale | Porta interna container | Porta host in docker compose |
|-------------------------------|----------|--------------------------|-------------------------|------------------------------|
| `flutter-template`            | frontend | 5300                     | 80                      | 8081                         |
| `angular-template`            | frontend | 4200                     | 80                      | 8082                         |
| `react-template`              | frontend | 5173                     | 80                      | 8083                         |
| `csharp-frontend-template`    | frontend | 5200                     | 80                      | 8084                         |
| `java-backend-template`       | backend  | 8080                     | 8080                    | 8085                         |
| `python-backend-template`     | backend  | 8000                     | 8000                    | 8086                         |
| `dotnet-backend-template`     | backend  | 5080                     | 8080                    | 8087                         |
| `typescript-backend-template` | backend  | 3001                     | 3001                    | 8088                         |
| `nodejs-backend-template`     | backend  | 3000                     | 3000                    | 8089                         |

## Come i frontend raggiungono il backend

- Il codice dei frontend chiama sempre percorsi **relativi** `/api/...`.
- **In sviluppo** il dev server (Vite, Angular CLI) fa da proxy di `/api` verso
  `http://localhost:3000` (backend Node.js); si cambia con la variabile `API_PROXY_TARGET`.
  Flutter e Blazor non hanno un proxy: usano un URL assoluto configurabile
  (`API_BASE_URL`) e si appoggiano al CORS del backend.
- **In Docker** ogni frontend è servito da nginx, che fa da reverse proxy di `/api/`
  verso l'URL indicato nella variabile `API_UPSTREAM`
  (default in compose: `http://nodejs-backend-template:3000`).
  nginx risolve l'host a runtime, quindi il container parte anche se il backend non c'è
  (in quel caso l'indicatore di stato mostra "offline").
