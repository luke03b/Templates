"""Personalizzazione dello schema OpenAPI (quello mostrato da Swagger UI e ReDoc).

FastAPI documenta in automatico una risposta 422 per ogni endpoint con input, ma questa
API restituisce invece 400 Problem Details (vedi `app/core/errors.py`). Qui:
- togliamo le risposte 422 e gli schemi `HTTPValidationError` / `ValidationError`;
- dichiariamo gli errori (4xx/5xx) come `application/problem+json`.
"""

from typing import Any

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

from app.core.errors import PROBLEM_JSON


def _adjust_responses(schema: dict[str, Any]) -> None:
    for path_item in schema.get("paths", {}).values():
        for operation in path_item.values():
            responses: dict[str, Any] = operation.get("responses", {})
            responses.pop("422", None)
            for code, response in responses.items():
                content = response.get("content", {})
                if code[0] in "45" and "application/json" in content:
                    content[PROBLEM_JSON] = content.pop("application/json")

    schemas = schema.get("components", {}).get("schemas", {})
    for name in ("HTTPValidationError", "ValidationError"):
        schemas.pop(name, None)


def install_custom_openapi(app: FastAPI) -> None:
    """Sostituisce `app.openapi` con una versione che genera (una volta) lo schema corretto."""

    def custom_openapi() -> dict[str, Any]:
        if app.openapi_schema is None:
            schema = get_openapi(
                title=app.title,
                version=app.version,
                description=app.description,
                routes=app.routes,
            )
            _adjust_responses(schema)
            app.openapi_schema = schema
        return app.openapi_schema

    # Assegnare un metodo a un'istanza è il modo documentato da FastAPI per farlo.
    app.openapi = custom_openapi  # type: ignore[method-assign]
