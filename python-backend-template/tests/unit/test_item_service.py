"""Unit test di `ItemService`: nessun HTTP, repository in memoria e orologio finto."""

from datetime import UTC, datetime, timedelta

import pytest

from app.core.errors import NotFoundError
from app.models.item import Item
from app.repositories.item_repository import InMemoryItemRepository
from app.schemas.item import ItemInput
from app.services.item_service import ItemService

T0 = datetime(2026, 11, 3, 18, 0, tzinfo=UTC)


class FakeClock:
    """Orologio controllabile: ogni chiamata avanza di un minuto."""

    def __init__(self, start: datetime) -> None:
        self.current = start

    def __call__(self) -> datetime:
        now = self.current
        self.current += timedelta(minutes=1)
        return now


@pytest.fixture
def repository() -> InMemoryItemRepository:
    return InMemoryItemRepository()


@pytest.fixture
def service(repository: InMemoryItemRepository) -> ItemService:
    return ItemService(repository, clock=FakeClock(T0))


def _input(name: str = "Book", price: float = 10.0, description: str | None = None) -> ItemInput:
    return ItemInput(name=name, price=price, description=description)


def test_create_item_generates_id_and_timestamps(service: ItemService) -> None:
    item = service.create_item(_input(description="Paperback"))

    assert item.id
    assert item.name == "Book"
    assert item.description == "Paperback"
    assert item.created_at == item.updated_at == T0


def test_list_items_is_ordered_by_created_at(service: ItemService) -> None:
    first = service.create_item(_input("First"))
    second = service.create_item(_input("Second"))

    assert [item.id for item in service.list_items()] == [first.id, second.id]


def test_get_item_raises_not_found(service: ItemService) -> None:
    with pytest.raises(NotFoundError):
        service.get_item("missing")


def test_update_item_keeps_created_at_and_moves_updated_at(service: ItemService) -> None:
    created = service.create_item(_input())

    updated = service.update_item(created.id, _input("New name", 3.0))

    assert updated.name == "New name"
    assert updated.price == 3.0
    assert updated.created_at == created.created_at
    assert updated.updated_at == T0 + timedelta(minutes=1)
    assert service.get_item(created.id) == updated


def test_update_item_raises_not_found(service: ItemService) -> None:
    with pytest.raises(NotFoundError):
        service.update_item("missing", _input())


def test_update_item_raises_not_found_if_deleted_concurrently(seed_item: Item) -> None:
    class VanishingRepository(InMemoryItemRepository):
        def update(self, item: Item) -> bool:
            return False

    service = ItemService(VanishingRepository([seed_item]))

    with pytest.raises(NotFoundError):
        service.update_item(seed_item.id, _input())


def test_delete_item_removes_it(service: ItemService) -> None:
    created = service.create_item(_input())

    service.delete_item(created.id)

    with pytest.raises(NotFoundError):
        service.get_item(created.id)


def test_delete_item_raises_not_found(service: ItemService) -> None:
    with pytest.raises(NotFoundError):
        service.delete_item("missing")


@pytest.fixture
def seed_item() -> Item:
    return Item(
        id="fixed-id",
        name="Seed",
        description=None,
        price=1.0,
        created_at=T0,
        updated_at=T0,
    )
