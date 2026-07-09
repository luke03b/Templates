# Python Backend Template

Template backend Python con FastAPI, organizzato in layer semplici e con un endpoint di health.

## Cosa installare in locale

- Python 3.12 o superiore.
- pip.
- Un ambiente virtuale consigliato, ad esempio `venv`.

Verifica rapida dell'ambiente:

```bash
python --version
pip --version
```

## Avvio in locale

1. Crea e attiva l'ambiente virtuale.

```bash
python -m venv .venv
.venv\Scripts\activate
```

2. Installa le dipendenze.

```bash
pip install -r requirements.txt
```

3. Esegui i test.

```bash
pytest
```

4. Avvia l'applicazione.

```bash
uvicorn app.main:app --reload
```

5. Apri `http://localhost:8000/docs` oppure `http://localhost:8000/api/health`.

## Avvio con Docker

1. Costruisci l'immagine.

```bash
docker build -t python-backend-template .
```

2. Avvia il container.

```bash
docker run --rm -p 8000:8000 python-backend-template
```

3. Apri `http://localhost:8000/api/health`.

## Struttura

- `app/main.py` - bootstrap dell'app
- `app/api/health.py` - layer API
- `app/services/health_service.py` - layer applicativo
- `app/schemas/health.py` - contratto di risposta
- `tests/test_health.py` - test dell'endpoint

## Avvio

1. Crea e attiva un ambiente virtuale.
2. Installa le dipendenze con `pip install -r requirements.txt`.
3. Avvia l'app con `uvicorn app.main:app --reload`.

## Endpoint

- `GET /api/health` restituisce lo stato corrente dell'applicazione.
