"""Test HTTP trasversali: errori generici (404/405/500), CORS e documentazione OpenAPI."""

from fastapi import FastAPI
from fastapi.testclient import TestClient


def test_unknown_route_returns_404_problem(client: TestClient) -> None:
    response = client.get("/api/does-not-exist")

    assert response.status_code == 404
    assert response.headers["content-type"] == "application/problem+json"
    assert response.json() == {
        "type": "about:blank",
        "title": "Not Found",
        "status": 404,
        "detail": "The requested resource was not found.",
    }


def test_wrong_method_returns_405_problem(client: TestClient) -> None:
    response = client.patch("/api/health")

    assert response.status_code == 405
    assert response.json()["status"] == 405
    assert "GET" in response.headers["allow"]


def test_unexpected_error_returns_generic_500_without_leaking(app: FastAPI) -> None:
    def explode() -> None:
        raise RuntimeError("secret database password is hunter2")

    app.add_api_route("/api/boom", explode)
    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/api/boom", headers={"Origin": "http://localhost:5173"})

    assert response.status_code == 500
    assert response.headers["content-type"] == "application/problem+json"
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    body = response.json()
    assert body["title"] == "Internal Server Error"
    assert "hunter2" not in response.text
    assert "Traceback" not in response.text


def test_cors_allows_configured_origin(client: TestClient) -> None:
    response = client.options(
        "/api/items",
        headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"},
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_cors_rejects_unknown_origin(client: TestClient) -> None:
    response = client.get("/api/health", headers={"Origin": "http://evil.example"})

    assert "access-control-allow-origin" not in response.headers


def test_docs_and_redoc_are_served(client: TestClient) -> None:
    assert client.get("/docs").status_code == 200
    assert client.get("/redoc").status_code == 200


def test_openapi_documents_400_problem_instead_of_422(client: TestClient) -> None:
    schema = client.get("/openapi.json").json()

    post = schema["paths"]["/api/items"]["post"]["responses"]
    assert "422" not in post
    assert "application/problem+json" in post["400"]["content"]
    assert "HTTPValidationError" not in schema["components"]["schemas"]
    item_schema = schema["components"]["schemas"]["ItemResponse"]["properties"]
    assert {"createdAt", "updatedAt"} <= set(item_schema)
