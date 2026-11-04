"""Middleware ASGI che per ogni richiesta: assegna un request id, misura la durata,
scrive una riga di access log e trasforma le eccezioni non gestite in un 500 Problem Details.

Un middleware avvolge l'intera applicazione: riceve la richiesta prima degli endpoint e
la risposta dopo. È scritto come middleware ASGI "puro" (non `BaseHTTPMiddleware`) perché
è più efficiente e non ha problemi con risposte in streaming.

Sta DENTRO `CORSMiddleware` (vedi `create_app`), così anche le risposte 500 hanno gli
header CORS e il browser può leggerle.
"""

import logging
import time
import uuid

from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.errors import internal_error_response

logger = logging.getLogger("app.request")

REQUEST_ID_HEADER = "X-Request-ID"


class RequestContextMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        incoming = dict(scope["headers"]).get(REQUEST_ID_HEADER.lower().encode())
        request_id = incoming.decode("latin-1")[:128] if incoming else str(uuid.uuid4())
        started = time.perf_counter()
        status_code = 500
        response_started = False

        async def send_wrapper(message: Message) -> None:
            nonlocal status_code, response_started
            if message["type"] == "http.response.start":
                response_started = True
                status_code = message["status"]
                MutableHeaders(scope=message)[REQUEST_ID_HEADER] = request_id
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        except Exception:
            logger.exception(
                "unhandled exception",
                extra={"context": {"requestId": request_id, "path": scope["path"]}},
            )
            if response_started:
                raise  # la risposta è già partita: non si può più cambiare.
            await internal_error_response()(scope, receive, send_wrapper)
        finally:
            duration_ms = round((time.perf_counter() - started) * 1000, 2)
            logger.info(
                "request completed",
                extra={
                    "context": {
                        "requestId": request_id,
                        "method": scope["method"],
                        "path": scope["path"],
                        "status": status_code,
                        "durationMs": duration_ms,
                    }
                },
            )
