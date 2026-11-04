"""Permette di avviare il server con `python -m app`, leggendo HOST e PORT dalla configurazione.

Opzione `--reload`: riavvia il server a ogni modifica del codice (solo sviluppo).
"""

import argparse

import uvicorn

from app.core.config import get_settings
from app.core.logging import configure_logging


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Python backend template.")
    parser.add_argument("--reload", action="store_true", help="reload on code changes (dev)")
    args = parser.parse_args()

    settings = get_settings()
    configure_logging(settings.log_level)
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=args.reload,
        log_config=None,  # il logging lo configuriamo noi (JSON), vedi app/core/logging.py
        proxy_headers=True,
    )


if __name__ == "__main__":
    main()
