"""Router di `GET /api/health`: usato da healthcheck Docker, load balancer e frontend."""

from fastapi import APIRouter

from app.api.dependencies import HealthServiceDep
from app.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", summary="Service health status")
def get_health(service: HealthServiceDep) -> HealthResponse:
    return service.get_status()
