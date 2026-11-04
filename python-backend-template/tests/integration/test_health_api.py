"""Test HTTP di `GET /api/health`."""

from datetime import datetime

from fastapi.testclient import TestClient


def test_health_returns_ok_status(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "python-backend-template"
    assert body["timestamp"].endswith("Z")
    datetime.fromisoformat(body["timestamp"])  # solleva eccezione se non è ISO 8601


def test_health_sets_request_id_header(client: TestClient) -> None:
    response = client.get("/api/health", headers={"X-Request-ID": "abc-123"})

    assert response.headers["X-Request-ID"] == "abc-123"
