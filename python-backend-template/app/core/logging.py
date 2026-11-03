"""Logging strutturato in JSON (una riga = un evento) con la sola libreria standard.

I log JSON sono facili da filtrare con strumenti come `jq`, Loki, Elastic o CloudWatch.
Per aggiungere dati a un evento usa `extra={"context": {...}}`:

    logger.info("item created", extra={"context": {"itemId": item.id}})
"""

import json
import logging
import sys
from datetime import UTC, datetime
from typing import Any

from app.core.config import LogLevel

# Il contratto usa "warn", il modulo logging di Python usa "WARNING".
_LEVELS: dict[str, int] = {
    "debug": logging.DEBUG,
    "info": logging.INFO,
    "warn": logging.WARNING,
    "error": logging.ERROR,
}


class JsonFormatter(logging.Formatter):
    """Trasforma un `LogRecord` in una riga JSON."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=UTC)
            .isoformat(timespec="milliseconds")
            .replace("+00:00", "Z"),
            "level": record.levelname.lower(),
            "logger": record.name,
            "message": record.getMessage(),
        }
        context = getattr(record, "context", None)
        if isinstance(context, dict):
            payload.update(context)
        if record.exc_info:
            # Lo stack trace finisce SOLO nei log, mai nella risposta HTTP.
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str, ensure_ascii=False)


def configure_logging(level: LogLevel) -> None:
    """Configura il root logger e allinea i logger di uvicorn allo stesso formato."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())

    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel(_LEVELS[level])

    # Uvicorn installa i propri handler: li togliamo e facciamo propagare al root,
    # così anche i suoi messaggi escono in JSON. L'access log di uvicorn è disattivato
    # perché ogni richiesta viene già loggata da `RequestContextMiddleware`.
    for name in ("uvicorn", "uvicorn.error"):
        uvicorn_logger = logging.getLogger(name)
        uvicorn_logger.handlers.clear()
        uvicorn_logger.propagate = True
    logging.getLogger("uvicorn.access").disabled = True
