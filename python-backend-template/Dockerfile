# Dockerfile multi-stage per il backend FastAPI.
#
# Stage 1 "builder": crea un virtualenv in /opt/venv con le sole dipendenze runtime
#                    (da requirements.txt, generato dal lockfile uv.lock).
# Stage 2 "runtime": copia solo il virtualenv e il codice; niente pip cache, niente tool di build.
#
# Build: docker build -t python-backend-template .
# Run:   docker run --rm -p 8000:8000 python-backend-template

# Versione di Python fissata (tag esatto, mai "latest"): build riproducibili.
ARG PYTHON_IMAGE=python:3.14.6-slim-trixie

# ------------------------------------------------------------------ stage 1: dipendenze
FROM ${PYTHON_IMAGE} AS builder

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copiamo prima SOLO requirements.txt: se il codice cambia ma le dipendenze no,
# Docker riusa questo layer dalla cache e la build è molto più veloce.
COPY requirements.txt .
# Dopo l'installazione pip non serve più: lo togliamo dal venv (immagine più piccola).
RUN pip install -r requirements.txt \
    && pip uninstall --yes pip

# ------------------------------------------------------------------ stage 2: runtime
FROM ${PYTHON_IMAGE} AS runtime

# PYTHONDONTWRITEBYTECODE: niente file .pyc; PYTHONUNBUFFERED: log subito su stdout.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    HOST=0.0.0.0 \
    PORT=8000 \
    LOG_LEVEL=info

# Utente senza privilegi: se l'app venisse compromessa, l'attaccante non è root.
RUN groupadd --system app && useradd --system --gid app --no-create-home app

WORKDIR /srv
COPY --from=builder /opt/venv /opt/venv
COPY app ./app

USER app

EXPOSE 8000

# python:slim non include curl: il controllo usa la libreria standard di Python.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen(f'http://127.0.0.1:{os.environ.get(\"PORT\", \"8000\")}/api/health', timeout=4)" || exit 1

# `python -m app` legge HOST e PORT dalle variabili d'ambiente (vedi app/__main__.py).
CMD ["python", "-m", "app"]
