"""Schemi Problem Details (RFC 9457) usati per TUTTE le risposte di errore.

Servono sia a costruire le risposte sia a documentarle in Swagger (`responses=` nei router).
"""

from pydantic import Field

from app.schemas.base import ApiModel


class ProblemDetails(ApiModel):
    """Errore generico: 404, 405, 500, ..."""

    type: str = Field(default="about:blank", examples=["about:blank"])
    title: str = Field(examples=["Not Found"])
    status: int = Field(examples=[404])
    detail: str | None = Field(default=None, examples=["Item 'abc' was not found."])


class ValidationProblemDetails(ProblemDetails):
    """Errore di validazione (400): `errors` mappa ogni campo alla lista dei suoi messaggi."""

    errors: dict[str, list[str]] = Field(
        examples=[
            {"name": ["name is required"], "price": ["price must be greater than or equal to 0"]}
        ]
    )
