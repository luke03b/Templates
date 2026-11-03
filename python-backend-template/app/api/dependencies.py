"""Dependency injection: le "factory" che FastAPI chiama per fornire oggetti agli endpoint.

Come funziona `Depends`: se un parametro dell'endpoint è annotato con
`Annotated[ItemService, Depends(get_item_service)]`, FastAPI chiama `get_item_service`
(risolvendo a sua volta le SUE dipendenze) e passa il risultato all'endpoint.
Nei test si può sostituire qualsiasi factory con `app.dependency_overrides[factory] = ...`.

Gli alias `ItemServiceDep`, `HealthServiceDep` evitano di ripetere `Annotated[...]` ovunque.
"""

from typing import Annotated, cast

from fastapi import Depends, Request

from app.core.config import Settings
from app.repositories.item_repository import ItemRepository
from app.services.health_service import HealthService
from app.services.item_service import ItemService


def get_settings_from_app(request: Request) -> Settings:
    return cast(Settings, request.app.state.settings)


def get_item_repository(request: Request) -> ItemRepository:
    # Il repository è unico per applicazione (creato in `create_app`) e condiviso tra le
    # richieste: è lui a tenere i dati in memoria.
    return cast(ItemRepository, request.app.state.item_repository)


def get_item_service(
    repository: Annotated[ItemRepository, Depends(get_item_repository)],
) -> ItemService:
    # Il service è leggero e senza stato: se ne crea uno per richiesta.
    return ItemService(repository)


def get_health_service(
    settings: Annotated[Settings, Depends(get_settings_from_app)],
) -> HealthService:
    return HealthService(settings.service_name)


ItemServiceDep = Annotated[ItemService, Depends(get_item_service)]
HealthServiceDep = Annotated[HealthService, Depends(get_health_service)]
