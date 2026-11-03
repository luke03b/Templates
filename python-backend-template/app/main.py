"""Punto d'ingresso ASGI: crea e configura l'applicazione FastAPI.

`create_app()` è una "application factory": costruisce un'app nuova a ogni chiamata.
Vantaggi: i test creano app isolate (repository pulito, settings personalizzate) e la
configurazione avviene in un punto solo.

Avvio: `uvicorn app.main:app --reload` (sviluppo) oppure `python -m app` (usa PORT/HOST).
Documentazione interattiva: Swagger UI su /docs, ReDoc su /redoc, schema su /openapi.json.
"""

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import Settings, get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging
from app.core.middleware import REQUEST_ID_HEADER, RequestContextMiddleware
from app.core.openapi import install_custom_openapi
from app.repositories.item_repository import InMemoryItemRepository, ItemRepository
from app.repositories.seed import build_seed_items

logger = logging.getLogger(__name__)


def create_app(
    settings: Settings | None = None, item_repository: ItemRepository | None = None
) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level)

    # `lifespan` è il codice eseguito all'avvio (prima di `yield`) e allo spegnimento (dopo).
    # È il posto giusto per aprire/chiudere connessioni a database, client HTTP, ecc.
    @asynccontextmanager
    async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
        logger.info(
            "service started",
            extra={"context": {"service": settings.service_name, "port": settings.port}},
        )
        yield
        logger.info("service stopped")

    app = FastAPI(
        title="Python Backend Template",
        version="1.0.0",
        description="FastAPI template: health check and in-memory CRUD for `items`.",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Oggetti condivisi da tutte le richieste: letti dalle dipendenze in app/api/dependencies.py.
    app.state.settings = settings
    app.state.item_repository = item_repository or InMemoryItemRepository(build_seed_items())

    # L'ultimo middleware aggiunto è il più esterno: CORS avvolge RequestContextMiddleware,
    # così anche le risposte di errore 500 ricevono gli header CORS.
    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Location", REQUEST_ID_HEADER],
    )

    register_exception_handlers(app)
    app.include_router(api_router)
    install_custom_openapi(app)
    return app


# Istanza usata da uvicorn (`app.main:app`).
app = create_app()
