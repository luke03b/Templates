"""DTO della risorsa `items`: cosa entra (ItemInput) e cosa esce (ItemResponse) dall'API.

Le regole di validazione del contratto sono dichiarate qui con `Field(...)`: FastAPI le
applica PRIMA di chiamare l'endpoint. Gli errori diventano un 400 Problem Details
(vedi `app/core/errors.py`).
"""

from typing import Self

from pydantic import ConfigDict, Field

from app.models.item import Item
from app.schemas.base import ApiModel, UtcDateTime


class ItemInput(ApiModel):
    """Corpo di POST e PUT."""

    # str_strip_whitespace: "  pippo  " diventa "pippo" prima dei controlli di lunghezza,
    # quindi un nome fatto di soli spazi è considerato vuoto.
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100, examples=["Keyboard"])
    description: str | None = Field(
        default=None, max_length=500, examples=["Mechanical, US layout"]
    )
    # strict: rifiuta stringhe ("12") e booleani; allow_inf_nan: rifiuta NaN/Infinity.
    price: float = Field(ge=0, strict=True, allow_inf_nan=False, examples=[49.9])


class ItemResponse(ApiModel):
    """Rappresentazione pubblica di un item."""

    id: str = Field(examples=["3f2b8c1e-7a4d-4e9b-9c55-0d1e2f3a4b5c"])
    name: str
    description: str | None
    price: float
    created_at: UtcDateTime
    updated_at: UtcDateTime

    @classmethod
    def from_domain(cls, item: Item) -> Self:
        """Converte il modello di dominio nel DTO: il dominio non viene mai esposto direttamente."""
        return cls(
            id=item.id,
            name=item.name,
            description=item.description,
            price=item.price,
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
