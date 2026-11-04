"""Accesso ai dati degli item: interfaccia (`ItemRepository`) + implementazione in memoria.

`Protocol` definisce un'interfaccia "strutturale": qualsiasi classe che abbia questi metodi
è considerata un `ItemRepository`, senza bisogno di ereditare. Per passare a un database
basta scrivere, ad esempio, `SqlItemRepository` con gli stessi metodi e cambiare la
factory in `app/api/dependencies.py`: service e router restano invariati.
"""

import threading
from typing import Protocol

from app.models.item import Item


class ItemRepository(Protocol):
    def list_all(self) -> list[Item]:
        """Tutti gli item ordinati per `created_at` crescente."""
        ...

    def get(self, item_id: str) -> Item | None: ...

    def add(self, item: Item) -> None: ...

    def update(self, item: Item) -> bool:
        """Sostituisce l'item con lo stesso id. Restituisce False se non esiste."""
        ...

    def delete(self, item_id: str) -> bool:
        """Restituisce False se l'item non esiste."""
        ...


class InMemoryItemRepository:
    """Repository in memoria: i dati si perdono al riavvio del processo.

    Gli endpoint `def` (sincroni) di FastAPI girano in un pool di thread, quindi più
    richieste possono toccare il dizionario insieme: il `Lock` rende le operazioni atomiche.
    """

    def __init__(self, items: list[Item] | None = None) -> None:
        self._items: dict[str, Item] = {item.id: item for item in items or []}
        self._lock = threading.Lock()

    def list_all(self) -> list[Item]:
        with self._lock:
            return sorted(self._items.values(), key=lambda item: item.created_at)

    def get(self, item_id: str) -> Item | None:
        with self._lock:
            return self._items.get(item_id)

    def add(self, item: Item) -> None:
        with self._lock:
            self._items[item.id] = item

    def update(self, item: Item) -> bool:
        with self._lock:
            if item.id not in self._items:
                return False
            self._items[item.id] = item
            return True

    def delete(self, item_id: str) -> bool:
        with self._lock:
            return self._items.pop(item_id, None) is not None
