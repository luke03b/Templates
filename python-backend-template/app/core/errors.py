"""Gestione centralizzata degli errori nel formato Problem Details (RFC 9457).

Cosa succede per ogni tipo di errore:
- `AppError` (es. `NotFoundError`) sollevato dai service  -> status dell'errore (404, ...).
- `RequestValidationError` di FastAPI (di default 422)    -> 400 con `errors: campo -> messaggi`.
- `HTTPException` di Starlette (rotta inesistente, 405)  -> stesso status, formato Problem.
- Qualsiasi altra eccezione                               -> 500 generico, gestito da
  `RequestContextMiddleware` (vedi `app/core/middleware.py`): lo stack trace va solo nei log.

Un "exception handler" è una funzione che FastAPI chiama al posto dell'endpoint quando
viene sollevata un'eccezione del tipo registrato.
"""

from collections.abc import Mapping
from http import HTTPStatus
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.schemas.problem import ProblemDetails, ValidationProblemDetails

PROBLEM_JSON = "application/problem+json"

# Prefissi di `loc` che indicano DOVE stava il dato: non fanno parte del nome del campo.
_LOCATION_PREFIXES = {"body", "query", "path", "header", "cookie"}


class AppError(Exception):
    """Errore applicativo previsto: ha uno status HTTP e un messaggio sicuro per il client."""

    status_code: int = HTTPStatus.BAD_REQUEST

    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


class NotFoundError(AppError):
    status_code = HTTPStatus.NOT_FOUND


def problem_response(
    status: int,
    detail: str | None = None,
    *,
    title: str | None = None,
    errors: dict[str, list[str]] | None = None,
    headers: Mapping[str, str] | None = None,
) -> JSONResponse:
    """Costruisce una risposta `application/problem+json`."""
    resolved_title = title or HTTPStatus(status).phrase
    problem: ProblemDetails
    if errors is None:
        problem = ProblemDetails(title=resolved_title, status=status, detail=detail)
    else:
        problem = ValidationProblemDetails(
            title=resolved_title, status=status, detail=detail, errors=errors
        )
    return JSONResponse(
        status_code=status,
        content=problem.model_dump(mode="json", exclude_none=True),
        media_type=PROBLEM_JSON,
        headers=headers,
    )


def internal_error_response() -> JSONResponse:
    return problem_response(
        HTTPStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred. Please try again later."
    )


# ------------------------------------------------------------------ validazione -> 400


def _field_name(loc: tuple[int | str, ...]) -> str:
    parts = [str(part) for part in loc]
    if len(parts) > 1 and parts[0] in _LOCATION_PREFIXES:
        parts = parts[1:]
    return ".".join(parts) if parts else "body"


def _number(value: object) -> str:
    # 0.0 -> "0", 2.5 -> "2.5": i messaggi restano uguali a quelli del contratto.
    return f"{value:g}" if isinstance(value, float) else str(value)


def _message_for(field: str, error: dict[str, Any]) -> str:
    """Traduce i codici di errore di Pydantic in messaggi leggibili e stabili."""
    error_type = error["type"]
    ctx = error.get("ctx") or {}
    if field == "body":
        if error_type == "missing":
            return "request body is required"
        if error_type == "json_invalid":
            return "request body must be valid JSON"
        if error_type in {"model_attributes_type", "dict_type"}:
            return "request body must be a JSON object"
    match error_type:
        case "missing":
            return f"{field} is required"
        case "string_too_short" if ctx.get("min_length") == 1:
            return f"{field} must not be empty"
        case "string_too_short":
            return f"{field} must be at least {ctx['min_length']} characters long"
        case "string_too_long":
            return f"{field} must be at most {ctx['max_length']} characters long"
        case "string_type":
            return f"{field} must be a string"
        case "float_type" | "float_parsing" | "int_type" | "int_parsing" | "finite_number":
            return f"{field} must be a number"
        case "greater_than_equal":
            return f"{field} must be greater than or equal to {_number(ctx['ge'])}"
        case _:
            return f"{field}: {error['msg']}"


def _validation_errors(exc: RequestValidationError) -> dict[str, list[str]]:
    errors: dict[str, list[str]] = {}
    for error in exc.errors():
        # Un JSON malformato ha `loc=("body", <posizione>)`: lo attribuiamo a "body".
        field = "body" if error["type"] == "json_invalid" else _field_name(tuple(error["loc"]))
        errors.setdefault(field, []).append(_message_for(field, error))
    return errors


# ------------------------------------------------------------------ handler


async def _handle_app_error(_request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, AppError)  # noqa: S101 - restringe il tipo per mypy
    return problem_response(exc.status_code, exc.detail)


async def _handle_validation_error(_request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, RequestValidationError)  # noqa: S101
    return problem_response(
        HTTPStatus.BAD_REQUEST,
        "One or more fields are invalid.",
        title="Validation failed",
        errors=_validation_errors(exc),
    )


async def _handle_http_exception(_request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, StarletteHTTPException)  # noqa: S101
    if exc.status_code == HTTPStatus.NOT_FOUND:
        detail = "The requested resource was not found."
    elif isinstance(exc.detail, str) and exc.detail != HTTPStatus(exc.status_code).phrase:
        detail = exc.detail
    else:
        detail = None
    return problem_response(exc.status_code, detail, headers=exc.headers)


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, _handle_app_error)
    app.add_exception_handler(RequestValidationError, _handle_validation_error)
    app.add_exception_handler(StarletteHTTPException, _handle_http_exception)
