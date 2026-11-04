# Python Backend Template

Template backend **Python + FastAPI** pronto da copiare: espone le API comuni del progetto
(`/api/health` e CRUD `/api/items` in memoria) secondo il contratto
[`docs/api-contract.md`](../docs/api-contract.md), con architettura a layer, dependency
injection, errori in formato **Problem Details** (RFC 9457), logging JSON, CORS configurabile,
Swagger/ReDoc, test con coverage, lint/format con ruff, type checking con mypy e Docker.

## 1. Stack e versioni

Versioni esatte usate e verificate per questa guida (novembre 2026):

| Componente            | Versione   | A cosa serve                                                   |
|-----------------------|------------|----------------------------------------------------------------|
| Python                | 3.14.6     | runtime (ultima stabile supportata da tutte le dipendenze)     |
| FastAPI               | 0.162.0    | framework web, validazione, OpenAPI                            |
| Starlette             | 1.10.0     | toolkit ASGI sotto FastAPI (dipendenza transitiva)             |
| Uvicorn (`standard`)  | 0.54.0     | server ASGI (con uvloop, httptools, watchfiles per il reload)  |
| Pydantic              | 2.14.2     | schemi/DTO e validazione                                       |
| pydantic-settings     | 2.16.2     | configurazione da variabili d'ambiente e `.env`                |
| pytest                | 9.2.0      | test runner                                                    |
| pytest-cov            | 7.1.0      | coverage                                                       |
| httpx2                | 2.16.0     | client HTTP usato da `TestClient` (successore di httpx)        |
| ruff                  | 0.17.3     | linter + formatter                                             |
| mypy                  | 2.4.1      | type checker (opzionale)                                       |
| uv                    | 0.11.x     | gestore di progetto/dipendenze consigliato                     |
| Immagine Docker       | `python:3.14.6-slim-trixie` | base dell'immagine (build e runtime)          |

Porta: **8000** sia in locale sia nel container (host `8086` nel `docker-compose.yml` della root).

## 2. Struttura delle cartelle

```text
python-backend-template/
├── app/
│   ├── __main__.py            # `python -m app`: avvia uvicorn leggendo HOST/PORT
│   ├── main.py                # create_app(): factory che monta middleware, handler, router
│   ├── core/                  # infrastruttura trasversale
│   │   ├── config.py          # Settings (pydantic-settings): PORT, HOST, CORS_ORIGINS, LOG_LEVEL
│   │   ├── logging.py         # logging JSON su stdout
│   │   ├── errors.py          # AppError/NotFoundError + handler Problem Details (422 -> 400)
│   │   ├── middleware.py      # request id, access log, 500 generico senza stack trace
│   │   └── openapi.py         # schema OpenAPI: niente 422, errori come application/problem+json
│   ├── api/                   # layer HTTP (router "sottili")
│   │   ├── router.py          # monta tutti i router sotto /api
│   │   ├── dependencies.py    # factory per Depends (repository, service, settings)
│   │   ├── health.py          # GET /api/health
│   │   └── items.py           # CRUD /api/items
│   ├── schemas/               # DTO Pydantic (contratto JSON in camelCase)
│   │   ├── base.py            # ApiModel (camelCase) + UtcDateTime (ISO 8601 con "Z")
│   │   ├── problem.py         # ProblemDetails, ValidationProblemDetails
│   │   ├── health.py
│   │   └── item.py            # ItemInput (validazione), ItemResponse
│   ├── services/              # logica di business, nessuna conoscenza di HTTP
│   │   ├── health_service.py
│   │   └── item_service.py
│   ├── repositories/          # accesso ai dati
│   │   ├── item_repository.py # ItemRepository (Protocol) + InMemoryItemRepository
│   │   └── seed.py            # 3 item di esempio caricati all'avvio
│   └── models/
│       └── item.py            # entità di dominio (dataclass immutabile)
├── tests/
│   ├── conftest.py            # fixture: app nuova e TestClient per ogni test
│   ├── unit/                  # test del service e della configurazione
│   └── integration/           # test HTTP di tutti gli endpoint (successi ed errori)
├── pyproject.toml             # metadati, dipendenze, config di ruff/pytest/coverage/mypy
├── uv.lock                    # lockfile di uv (versioni esatte di TUTTE le dipendenze)
├── requirements.txt           # dipendenze runtime per pip (generato da uv.lock)
├── requirements-dev.txt       # runtime + sviluppo per pip (generato da uv.lock)
├── .python-version            # versione di Python usata da uv/pyenv
├── .env.example               # variabili d'ambiente documentate
├── Dockerfile                 # multi-stage, utente non-root, HEALTHCHECK
├── .dockerignore
└── .gitignore
```

Flusso di una richiesta: **router** (`app/api`) valida l'input con lo schema → chiama il
**service** (`app/services`) ottenuto via `Depends` → il service usa il **repository**
(`app/repositories`) → l'entità di dominio viene convertita nel **DTO** di risposta.
Le eccezioni di dominio (`NotFoundError`) vengono tradotte in Problem Details dagli handler
centralizzati in `app/core/errors.py`.

## 3. Prerequisiti e installazione dell'ambiente

Serve **Python 3.14** e, consigliato, **uv** (gestisce anche l'installazione di Python).
In alternativa basta Python 3.14 con `pip` e `venv` (inclusi in Python).

### Opzione consigliata: uv (tutti i sistemi)

uv è un gestore di progetti Python molto veloce ([docs ufficiali](https://docs.astral.sh/uv/getting-started/installation/)).
Può scaricare da solo la versione di Python giusta (legge `.python-version`).

| Sistema | Installazione                                                                                  | Dove viene installato        |
|---------|------------------------------------------------------------------------------------------------|------------------------------|
| Windows | `winget install --id=astral-sh.uv -e` oppure PowerShell: `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 \| iex"` | `%USERPROFILE%\.local\bin` |
| macOS   | `brew install uv` oppure `curl -LsSf https://astral.sh/uv/install.sh \| sh`                     | Homebrew o `~/.local/bin`    |
| Linux   | `curl -LsSf https://astral.sh/uv/install.sh \| sh` (oppure `pipx install uv`)                   | `~/.local/bin`               |

Poi installa Python (uv lo mette in `~/.local/share/uv/python`, su Windows in `%APPDATA%\uv\python`):

```bash
uv python install 3.14
uv --version
uv run python --version     # dentro la cartella del progetto: Python 3.14.x
```

### Opzione classica: Python + pip

| Sistema | Installazione                                                                                         | Dove viene installato                           |
|---------|-------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| Windows | installer da [python.org/downloads](https://www.python.org/downloads/) (spunta "Add python.exe to PATH") oppure `winget install Python.Python.3.14`. Si usa il launcher `py -3.14`. | `%LOCALAPPDATA%\Programs\Python\Python314` |
| macOS   | installer da [python.org](https://www.python.org/downloads/macos/) oppure `brew install python@3.14`   | `/Library/Frameworks/Python.framework` o Homebrew |
| Linux   | gestore pacchetti se offre la 3.14 (`sudo dnf install python3.14`, su Ubuntu/Debian `sudo apt install python3.14 python3.14-venv` dal PPA deadsnakes) oppure [pyenv](https://github.com/pyenv/pyenv): `pyenv install 3.14` | `/usr/bin/python3.14` o `~/.pyenv/versions` |

Verifica:

```bash
python3.14 --version        # Windows: py -3.14 --version
python3.14 -m pip --version
```

### Docker (facoltativo)

[Docker Desktop](https://www.docker.com/products/docker-desktop/) su Windows/macOS
(`winget install Docker.DockerDesktop` / `brew install --cask docker`), Docker Engine su Linux
([guida](https://docs.docker.com/engine/install/)). Verifica con `docker --version`.

### Editor consigliato

[VS Code](https://code.visualstudio.com/) con le estensioni **Python** (`ms-python.python`),
**Pylance** (`ms-python.vscode-pylance`), **Ruff** (`charliermarsh.ruff`) e, se vuoi, **Mypy Type Checker**
(`ms-python.mypy-type-checker`). In alternativa PyCharm. Seleziona come interprete `.venv`
della cartella del progetto (Command Palette → "Python: Select Interpreter").

## 4. Installazione delle dipendenze

Con **uv** (crea `.venv` e installa le versioni esatte di `uv.lock`, dev incluse):

```bash
cd python-backend-template
uv sync
```

Con **pip** e venv:

```bash
cd python-backend-template
python3.14 -m venv .venv            # Windows: py -3.14 -m venv .venv
source .venv/bin/activate           # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt # solo runtime: pip install -r requirements.txt
```

Copia la configurazione d'esempio (facoltativo, i default funzionano già):

```bash
cp .env.example .env                # Windows: copy .env.example .env
```

## 5. Comandi

Con uv ogni comando si lancia con `uv run ...` (non serve attivare il venv). Con pip, attiva
`.venv` e lancia lo stesso comando senza `uv run`.

| Azione                         | uv                                              | pip / venv attivo                         |
|--------------------------------|-------------------------------------------------|-------------------------------------------|
| Avvio sviluppo (auto-reload)   | `uv run python -m app --reload`                 | `python -m app --reload`                  |
| Avvio con la CLI di uvicorn    | `uv run uvicorn app.main:app --reload --port 8000` | `uvicorn app.main:app --reload --port 8000` |
| Test                           | `uv run pytest`                                 | `pytest`                                  |
| Test + coverage                | `uv run pytest --cov`                           | `pytest --cov`                            |
| Report coverage HTML           | `uv run pytest --cov --cov-report=html` (apri `htmlcov/index.html`) | idem senza `uv run` |
| Lint                           | `uv run ruff check .`                           | `ruff check .`                            |
| Lint con correzione automatica | `uv run ruff check --fix .`                     | `ruff check --fix .`                      |
| Format                         | `uv run ruff format .`                          | `ruff format .`                           |
| Type check (opzionale)         | `uv run mypy`                                   | `mypy`                                    |
| "Anteprima produzione"         | `uv run python -m app` (senza reload) oppure Docker | `python -m app`                      |

Python non ha una fase di "build": la verifica pre-rilascio è `ruff check`, `ruff format --check`,
`mypy`, `pytest --cov` (la coverage minima è 90%, configurata in `pyproject.toml`) e la build Docker.

Dopo l'avvio:

- API: <http://localhost:8000/api/health>, <http://localhost:8000/api/items>
- Swagger UI: <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>
- Schema OpenAPI: <http://localhost:8000/openapi.json>

## 6. Configurazione

Le variabili si leggono dall'ambiente o dal file `.env` (l'ambiente ha la precedenza).
Sono validate all'avvio da `app/core/config.py`: un valore errato blocca subito l'avvio con un errore chiaro.

| Variabile      | Default                                       | Descrizione                                            |
|----------------|-----------------------------------------------|--------------------------------------------------------|
| `PORT`         | `8000`                                        | porta HTTP                                             |
| `HOST`         | `127.0.0.1` (nel container `0.0.0.0`)         | interfaccia di ascolto                                 |
| `CORS_ORIGINS` | porte dev/docker di tutti i frontend (vedi `.env.example`) | origini consentite, separate da virgola    |
| `LOG_LEVEL`    | `info`                                        | `debug`, `info`, `warn`, `error`                       |

`PORT` e `HOST` sono usati da `python -m app`; se usi la CLI `uvicorn` passa `--port/--host`.

I log sono JSON su stdout, una riga per evento, con `requestId` (anche nell'header di risposta
`X-Request-ID`; se il client lo invia, viene riutilizzato).

## 7. Docker

```bash
# build
docker build -t python-backend-template .

# run (porta 8000)
docker run --rm -p 8000:8000 python-backend-template

# con variabili personalizzate
docker run --rm -p 8000:8000 -e LOG_LEVEL=debug -e CORS_ORIGINS=http://localhost:5173 python-backend-template

# stato dell'HEALTHCHECK (starting / healthy / unhealthy)
docker ps --format "table {{.Names}}\t{{.Status}}"
```

L'immagine è multi-stage (`builder` installa le dipendenze in un virtualenv, `runtime` copia
solo il venv e il codice), gira con l'utente non-root `app` e ha un `HEALTHCHECK` che chiama
`/api/health` con la libreria standard di Python (l'immagine slim non ha curl).

Con il `docker-compose.yml` della root (servizio `python-backend-template`, porta host **8086**):

```bash
# dalla cartella root del repository
docker compose up --build python-backend-template
curl http://localhost:8086/api/health
```

Per usarlo da un frontend in compose imposta su quel servizio
`API_UPSTREAM=http://python-backend-template:8000`.

## 8. API disponibili

Tutti i dettagli (con esempi) sono in Swagger su `/docs`. Riepilogo:

| Metodo   | Rotta              | Successo                              | Errori       |
|----------|--------------------|---------------------------------------|--------------|
| `GET`    | `/api/health`      | `200` `{status, service, timestamp}`  | -            |
| `GET`    | `/api/items`       | `200` array ordinato per `createdAt`  | -            |
| `GET`    | `/api/items/{id}`  | `200` item                            | `404`        |
| `POST`   | `/api/items`       | `201` item + header `Location`        | `400`        |
| `PUT`    | `/api/items/{id}`  | `200` item aggiornato                 | `400`, `404` |
| `DELETE` | `/api/items/{id}`  | `204` senza corpo                     | `404`        |

Esempi con curl:

```bash
curl http://localhost:8000/api/items
curl -i -X POST http://localhost:8000/api/items \
     -H "Content-Type: application/json" -d '{"name":"Pen","description":"Blue","price":1.5}'
curl -X PUT http://localhost:8000/api/items/<id> \
     -H "Content-Type: application/json" -d '{"name":"Pen","price":2}'
curl -i -X DELETE http://localhost:8000/api/items/<id>
```

Errore di validazione (FastAPI di default risponderebbe 422; qui è convertito in 400):

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

Regole di `ItemInput`: `name` obbligatorio, 1-100 caratteri dopo il trim; `description`
opzionale (`null`), max 500 caratteri; `price` numero `>= 0` (stringhe, booleani, NaN rifiutati).
Gli errori 404, 405 e 500 hanno lo stesso formato senza `errors`; il 500 ha sempre un messaggio
generico e lo stack trace finisce solo nei log.

## 9. Come aggiungere una nuova risorsa (passo passo)

Esempio: risorsa `categories`. Copia i file di `items` e rinomina.

1. **Modello di dominio** – `app/models/category.py`: una `@dataclass(frozen=True, slots=True)`
   con i campi salvati (`id`, `name`, `created_at`, ...).
2. **Schemi/DTO** – `app/schemas/category.py`: `CategoryInput(ApiModel)` con le regole
   `Field(min_length=..., ge=...)` e `CategoryResponse(ApiModel)` con `from_domain()`.
   Eredita da `ApiModel` per avere il JSON in camelCase; usa `UtcDateTime` per le date.
3. **Repository** – `app/repositories/category_repository.py`: un `Protocol`
   `CategoryRepository` con i metodi necessari e la classe `InMemoryCategoryRepository`.
4. **Service** – `app/services/category_service.py`: la logica; solleva `NotFoundError`
   (o una nuova sottoclasse di `AppError` in `app/core/errors.py`, es. `ConflictError` con
   `status_code = HTTPStatus.CONFLICT`) invece di restituire codici HTTP.
5. **Dipendenze** – in `app/api/dependencies.py` aggiungi `get_category_repository`
   (legge `request.app.state.category_repository`), `get_category_service` e l'alias
   `CategoryServiceDep = Annotated[CategoryService, Depends(get_category_service)]`.
6. **Stato dell'app** – in `create_app()` (`app/main.py`):
   `app.state.category_repository = InMemoryCategoryRepository()`.
7. **Router** – `app/api/categories.py` con `router = APIRouter(prefix="/categories", tags=["categories"])`
   ed endpoint sottili che chiamano il service; documenta gli errori con `responses=`.
8. **Registrazione** – in `app/api/router.py`: `api_router.include_router(categories.router)`.
9. **Test** – `tests/unit/test_category_service.py` e `tests/integration/test_categories_api.py`
   (usa le fixture `client`/`app` di `tests/conftest.py`).
10. Esegui `uv run ruff format . && uv run ruff check . && uv run mypy && uv run pytest --cov`.

Per passare a un database vero: scrivi `SqlItemRepository` con gli stessi metodi di
`ItemRepository` e crealo in `create_app()` al posto di `InMemoryItemRepository`
(apri/chiudi le connessioni nella funzione `lifespan`). Router e service non cambiano.

## 10. Problemi comuni

| Problema | Soluzione |
|----------|-----------|
| `requires-python >=3.14` / uv non trova Python | `uv python install 3.14`; con pip crea il venv con `python3.14` (o `py -3.14`). |
| `Address already in use` / porta 8000 occupata | Avvia con `PORT=8001 uv run python -m app` (PowerShell: `$env:PORT=8001; ...`) oppure trova il processo: `lsof -i :8000` / `netstat -ano \| findstr :8000`. |
| `ModuleNotFoundError: No module named 'app'` | Lancia i comandi dalla cartella `python-backend-template` (non da `app/`). |
| Windows: "l'esecuzione di script è disabilitata" attivando il venv | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, oppure usa `uv run` senza attivare. |
| Il browser blocca le chiamate (errore CORS) | Aggiungi l'origine del frontend a `CORS_ORIGINS` (schema + host + porta, senza `/` finale). |
| Ricevo 400 invece di 422 | È voluto: il contratto usa 400 Problem Details (`app/core/errors.py`). |
| Docker: `pip install` fallisce con errori SSL dietro proxy aziendale | Il proxy intercetta TLS: aggiungi il certificato aziendale alla build (es. variabile `PIP_CERT`) o usa un mirror PyPI interno. |
| Il container risulta `unhealthy` | Controlla `docker logs <container>`; se cambi `PORT` cambia anche la porta pubblicata (`-p 9000:9000 -e PORT=9000`). |
| I test non vedono le modifiche alle dipendenze | `uv sync` (o `pip install -r requirements-dev.txt`) dopo ogni modifica a `pyproject.toml`. |

## 11. Comandi utili extra

```bash
# aggiungere una dipendenza runtime / di sviluppo (aggiorna pyproject.toml e uv.lock)
uv add sqlalchemy
uv add --dev pytest-asyncio

# aggiornare tutte le dipendenze alle ultime versioni compatibili
uv lock --upgrade && uv sync

# vedere le dipendenze installate e quelle non aggiornate
uv tree
uv pip list --outdated

# rigenerare i requirements per chi usa pip (da fare dopo ogni modifica a uv.lock)
uv export --format requirements.txt --no-dev --no-hashes --no-emit-project -o requirements.txt
uv export --format requirements.txt --group dev --no-hashes --no-emit-project -o requirements-dev.txt

# eseguire un solo test, fermarsi al primo errore, mostrare i print
uv run pytest tests/integration/test_items_api.py -k create -x -s

# controllo completo prima di un commit
uv run ruff format --check . && uv run ruff check . && uv run mypy && uv run pytest --cov

# log più leggibili in sviluppo (richiede jq)
uv run python -m app | jq .

# pulizia di cache e venv
rm -rf .venv .pytest_cache .ruff_cache .mypy_cache htmlcov .coverage
```
