"""Fixture condivise da tutti i test.

Una "fixture" pytest è una funzione che prepara un oggetto per i test: basta mettere il
suo nome tra i parametri del test e pytest la esegue e passa il risultato.
Ogni test riceve un'app NUOVA (grazie a `create_app`), quindi i dati non si mescolano.
"""

from collections.abc import Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


@pytest.fixture
def settings() -> Settings:
    return Settings(log_level="error", cors_origins=["http://localhost:5173"])


@pytest.fixture
def app(settings: Settings) -> FastAPI:
    return create_app(settings)


@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    # raise_server_exceptions=False: vogliamo vedere la risposta 500 come la vedrebbe un client.
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client
