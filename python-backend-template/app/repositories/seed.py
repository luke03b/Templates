"""Dati di esempio caricati all'avvio, così i frontend mostrano subito qualcosa."""

import uuid
from datetime import UTC, datetime, timedelta

from app.models.item import Item

_SEED_DATA: list[tuple[str, str | None, float]] = [
    ("Mechanical keyboard", "Compact 75% layout with hot-swappable switches", 89.9),
    ("Wireless mouse", "Ergonomic mouse with USB-C charging", 39.5),
    ("USB-C hub", None, 24.0),
]


def build_seed_items(now: datetime | None = None) -> list[Item]:
    """Crea i 3 item di esempio con `created_at` distanziati di un secondo (ordine stabile)."""
    base = (now or datetime.now(UTC)) - timedelta(seconds=len(_SEED_DATA))
    items: list[Item] = []
    for index, (name, description, price) in enumerate(_SEED_DATA):
        timestamp = base + timedelta(seconds=index)
        items.append(
            Item(
                id=str(uuid.uuid4()),
                name=name,
                description=description,
                price=price,
                created_at=timestamp,
                updated_at=timestamp,
            )
        )
    return items
