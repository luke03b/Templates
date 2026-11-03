"""Router CRUD di `/api/items`: solo trasporto HTTP, la logica sta in `ItemService`.

Note su FastAPI:
- Il tipo di ritorno dell'endpoint (es. `-> ItemResponse`) diventa il `response_model`:
  FastAPI filtra e serializza la risposta e la documenta in Swagger.
- Gli endpoint sono `def` (sincroni): FastAPI li esegue in un thread pool. Usa `async def`
  solo se dentro fai `await` (es. driver di database asincrono, client HTTP async).
- `responses=` documenta in Swagger gli errori possibili (non cambia il comportamento).
"""

from typing import Any

from fastapi import APIRouter, Request, Response, status

from app.api.dependencies import ItemServiceDep
from app.schemas.item import ItemInput, ItemResponse
from app.schemas.problem import ProblemDetails, ValidationProblemDetails

router = APIRouter(prefix="/items", tags=["items"])

# Il media type `application/problem+json` viene impostato da `app/core/openapi.py`.
_NOT_FOUND: dict[int | str, dict[str, Any]] = {
    404: {"model": ProblemDetails, "description": "Item not found"}
}
_INVALID: dict[int | str, dict[str, Any]] = {
    400: {"model": ValidationProblemDetails, "description": "Validation failed"}
}


@router.get("", summary="List items ordered by creation date")
def list_items(service: ItemServiceDep) -> list[ItemResponse]:
    return [ItemResponse.from_domain(item) for item in service.list_items()]


@router.get("/{item_id}", summary="Get an item", responses=_NOT_FOUND)
def get_item(item_id: str, service: ItemServiceDep) -> ItemResponse:
    return ItemResponse.from_domain(service.get_item(item_id))


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Create an item",
    responses=_INVALID,
)
def create_item(
    payload: ItemInput, request: Request, response: Response, service: ItemServiceDep
) -> ItemResponse:
    item = service.create_item(payload)
    # `url_path_for` ricava il percorso dal nome dell'endpoint: niente URL scritti a mano.
    response.headers["Location"] = str(request.app.url_path_for("get_item", item_id=item.id))
    return ItemResponse.from_domain(item)


@router.put("/{item_id}", summary="Replace an item", responses=_INVALID | _NOT_FOUND)
def update_item(item_id: str, payload: ItemInput, service: ItemServiceDep) -> ItemResponse:
    return ItemResponse.from_domain(service.update_item(item_id, payload))


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an item",
    responses=_NOT_FOUND,
)
def delete_item(item_id: str, service: ItemServiceDep) -> Response:
    service.delete_item(item_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
