"""Base comune per tutti gli schemi (DTO) dell'API.

- In Python i campi si scrivono in snake_case (`created_at`), il contratto JSON vuole
  camelCase (`createdAt`): l'`alias_generator` traduce in automatico in entrambe le direzioni.
- `UtcDateTime` serializza le date come ISO 8601 UTC con suffisso `Z`
  (es. `2026-11-03T18:00:00.000Z`), uguale per tutti i backend del progetto.
"""

from datetime import UTC, datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, PlainSerializer
from pydantic.alias_generators import to_camel


def _format_utc(value: datetime) -> str:
    return value.astimezone(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z")


# `Annotated[tipo, metadati]` aggiunge comportamento a un tipo senza creare una classe nuova.
UtcDateTime = Annotated[datetime, PlainSerializer(_format_utc, return_type=str, when_used="json")]


class ApiModel(BaseModel):
    """Modello base: JSON in camelCase, accetta anche i nomi Python in costruzione."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        validate_by_name=True,
        validate_by_alias=True,
        serialize_by_alias=True,
    )
