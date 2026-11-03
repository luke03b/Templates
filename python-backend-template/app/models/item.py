"""Modello di dominio `Item`: è ciò che il repository salva e il service manipola.

È una `dataclass` (classe dati con __init__/__eq__ generati) congelata (`frozen=True`):
non si modifica sul posto, si crea una copia con `dataclasses.replace(item, name=...)`.
È separato dal DTO `ItemResponse` così il formato dell'API e quello di storage possono
evolvere indipendentemente (es. quando passerai a un database).
"""

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class Item:
    id: str
    name: str
    description: str | None
    price: float
    created_at: datetime
    updated_at: datetime
