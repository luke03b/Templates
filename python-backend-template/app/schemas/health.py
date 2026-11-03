"""DTO di risposta di `GET /api/health`."""

from typing import Literal

from app.schemas.base import ApiModel, UtcDateTime


class HealthResponse(ApiModel):
    status: Literal["ok"] = "ok"
    service: str
    timestamp: UtcDateTime
