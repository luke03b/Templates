"""Logica di business della risorsa `items`.

Il service non sa nulla di HTTP: riceve dati già validati, usa il repository e solleva
eccezioni di dominio (`NotFoundError`) che il gestore centrale trasforma in Problem Details.
L'orologio (`clock`) è iniettabile così i test possono controllare le date.
"""

import dataclasses
import logging
import uuid
from collections.abc import Callable
from datetime import UTC, datetime

from app.core.errors import NotFoundError
from app.models.item import Item
from app.repositories.item_repository import ItemRepository
from app.schemas.item import ItemInput

logger = logging.getLogger(__name__)


def _utc_now() -> datetime:
    return datetime.now(UTC)


class ItemService:
    def __init__(
        self, repository: ItemRepository, clock: Callable[[], datetime] = _utc_now
    ) -> None:
        self._repository = repository
        self._clock = clock

    def list_items(self) -> list[Item]:
        return self._repository.list_all()

    def get_item(self, item_id: str) -> Item:
        item = self._repository.get(item_id)
        if item is None:
            raise NotFoundError(f"Item '{item_id}' was not found.")
        return item

    def create_item(self, data: ItemInput) -> Item:
        now = self._clock()
        item = Item(
            id=str(uuid.uuid4()),
            name=data.name,
            description=data.description,
            price=data.price,
            created_at=now,
            updated_at=now,
        )
        self._repository.add(item)
        logger.info("item created", extra={"context": {"itemId": item.id}})
        return item

    def update_item(self, item_id: str, data: ItemInput) -> Item:
        current = self.get_item(item_id)
        updated = dataclasses.replace(
            current,
            name=data.name,
            description=data.description,
            price=data.price,
            updated_at=self._clock(),
        )
        if not self._repository.update(updated):
            # Cancellato da un'altra richiesta tra la lettura e la scrittura.
            raise NotFoundError(f"Item '{item_id}' was not found.")
        logger.info("item updated", extra={"context": {"itemId": item_id}})
        return updated

    def delete_item(self, item_id: str) -> None:
        if not self._repository.delete(item_id):
            raise NotFoundError(f"Item '{item_id}' was not found.")
        logger.info("item deleted", extra={"context": {"itemId": item_id}})
