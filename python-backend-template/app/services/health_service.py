from app.schemas.health import HealthResponse


def get_health_status() -> HealthResponse:
    return HealthResponse(status="UP", message="Python backend template is running")
