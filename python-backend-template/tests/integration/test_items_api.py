"""Test HTTP del CRUD `/api/items`: casi di successo ed errore, formato del contratto."""

import uuid

import pytest
from fastapi.testclient import TestClient

ITEM_KEYS = {"id", "name", "description", "price", "createdAt", "updatedAt"}
MISSING_ID = "00000000-0000-4000-8000-000000000000"


def _create(client: TestClient, **overrides: object) -> dict[str, object]:
    payload = {"name": "Desk lamp", "description": "LED", "price": 19.99} | overrides
    response = client.post("/api/items", json=payload)
    assert response.status_code == 201, response.text
    body: dict[str, object] = response.json()
    return body


def _assert_problem(response_json: dict[str, object], status: int) -> None:
    assert response_json["type"] == "about:blank"
    assert response_json["status"] == status
    assert isinstance(response_json["title"], str)


# ------------------------------------------------------------------ GET list


def test_list_returns_three_seed_items_ordered_by_created_at(client: TestClient) -> None:
    response = client.get("/api/items")

    assert response.status_code == 200
    items = response.json()
    assert len(items) == 3
    assert all(set(item) == ITEM_KEYS for item in items)
    created = [item["createdAt"] for item in items]
    assert created == sorted(created)


def test_list_includes_new_item_last(client: TestClient) -> None:
    created = _create(client)

    items = client.get("/api/items").json()

    assert items[-1]["id"] == created["id"]


# ------------------------------------------------------------------ GET by id


def test_get_returns_item(client: TestClient) -> None:
    seed = client.get("/api/items").json()[0]

    response = client.get(f"/api/items/{seed['id']}")

    assert response.status_code == 200
    assert response.json() == seed


@pytest.mark.parametrize("item_id", [MISSING_ID, "not-a-uuid"])
def test_get_unknown_item_returns_404_problem(client: TestClient, item_id: str) -> None:
    response = client.get(f"/api/items/{item_id}")

    assert response.status_code == 404
    assert response.headers["content-type"] == "application/problem+json"
    body = response.json()
    _assert_problem(body, 404)
    assert "errors" not in body


# ------------------------------------------------------------------ POST


def test_create_returns_201_with_location_and_generated_fields(client: TestClient) -> None:
    response = client.post(
        "/api/items", json={"name": "  Monitor  ", "description": None, "price": 199}
    )

    assert response.status_code == 201
    body = response.json()
    assert set(body) == ITEM_KEYS
    assert body["name"] == "Monitor"  # trim applicato
    assert body["price"] == 199
    assert body["description"] is None
    assert uuid.UUID(body["id"]).version == 4
    assert body["createdAt"] == body["updatedAt"]
    assert body["createdAt"].endswith("Z")
    assert response.headers["Location"] == f"/api/items/{body['id']}"
    assert client.get(response.headers["Location"]).status_code == 200


def test_create_without_description_defaults_to_null(client: TestClient) -> None:
    response = client.post("/api/items", json={"name": "Cable", "price": 0})

    assert response.status_code == 201
    assert response.json()["description"] is None


def test_create_with_empty_body_returns_400_for_each_required_field(client: TestClient) -> None:
    response = client.post("/api/items", json={})

    assert response.status_code == 400
    assert response.headers["content-type"] == "application/problem+json"
    body = response.json()
    _assert_problem(body, 400)
    assert body["title"] == "Validation failed"
    assert body["detail"] == "One or more fields are invalid."
    assert body["errors"] == {"name": ["name is required"], "price": ["price is required"]}


@pytest.mark.parametrize(
    ("payload", "field", "message"),
    [
        ({"name": "", "price": 1}, "name", "name must not be empty"),
        ({"name": "   ", "price": 1}, "name", "name must not be empty"),
        ({"name": "x" * 101, "price": 1}, "name", "name must be at most 100 characters long"),
        ({"name": 42, "price": 1}, "name", "name must be a string"),
        (
            {"name": "ok", "description": "d" * 501, "price": 1},
            "description",
            "description must be at most 500 characters long",
        ),
        ({"name": "ok", "price": -0.01}, "price", "price must be greater than or equal to 0"),
        ({"name": "ok", "price": "12"}, "price", "price must be a number"),
        ({"name": "ok", "price": True}, "price", "price must be a number"),
    ],
)
def test_create_with_invalid_field_returns_400(
    client: TestClient, payload: dict[str, object], field: str, message: str
) -> None:
    response = client.post("/api/items", json=payload)

    assert response.status_code == 400
    assert response.json()["errors"] == {field: [message]}


def test_create_with_malformed_json_returns_400(client: TestClient) -> None:
    response = client.post(
        "/api/items", content=b"{not json", headers={"Content-Type": "application/json"}
    )

    assert response.status_code == 400
    assert response.json()["errors"] == {"body": ["request body must be valid JSON"]}


def test_create_without_body_returns_400(client: TestClient) -> None:
    response = client.post("/api/items")

    assert response.status_code == 400
    assert response.json()["errors"] == {"body": ["request body is required"]}


def test_create_with_array_body_returns_400(client: TestClient) -> None:
    response = client.post("/api/items", json=[1, 2])

    assert response.status_code == 400
    assert response.json()["errors"] == {"body": ["request body must be a JSON object"]}


# ------------------------------------------------------------------ PUT


def test_update_replaces_fields_and_refreshes_updated_at(client: TestClient) -> None:
    created = _create(client)

    response = client.put(f"/api/items/{created['id']}", json={"name": "Renamed", "price": 5.5})

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == created["id"]
    assert body["name"] == "Renamed"
    assert body["description"] is None
    assert body["price"] == 5.5
    assert body["createdAt"] == created["createdAt"]
    assert body["updatedAt"] >= created["updatedAt"]
    assert client.get(f"/api/items/{created['id']}").json() == body


def test_update_unknown_item_returns_404(client: TestClient) -> None:
    response = client.put(f"/api/items/{MISSING_ID}", json={"name": "x", "price": 1})

    assert response.status_code == 404
    _assert_problem(response.json(), 404)


def test_update_with_invalid_body_returns_400(client: TestClient) -> None:
    created = _create(client)

    response = client.put(f"/api/items/{created['id']}", json={"name": "x", "price": -1})

    assert response.status_code == 400
    assert response.json()["errors"] == {"price": ["price must be greater than or equal to 0"]}


# ------------------------------------------------------------------ DELETE


def test_delete_returns_204_and_removes_item(client: TestClient) -> None:
    created = _create(client)

    response = client.delete(f"/api/items/{created['id']}")

    assert response.status_code == 204
    assert response.content == b""
    assert client.get(f"/api/items/{created['id']}").status_code == 404


def test_delete_unknown_item_returns_404(client: TestClient) -> None:
    response = client.delete(f"/api/items/{MISSING_ID}")

    assert response.status_code == 404
    _assert_problem(response.json(), 404)
