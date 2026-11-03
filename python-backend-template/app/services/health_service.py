"""Logica del controllo di salute: se il processo risponde, lo stato è "ok"."""

from datetime import UTC, datetime

from app.schemas.health import HealthResponse


class HealthService:
    def __init__(self, service_name: str) -> None:
        self._service_name = service_name

    def get_status(self) -> HealthResponse:
        return HealthResponse(service=self._service_name, timestamp=datetime.now(UTC))
