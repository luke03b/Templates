// Unit test del service: usa il repository in memoria e un orologio/generatore di id finti,
// cosi' i risultati sono deterministici (sempre uguali a ogni esecuzione).
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { InMemoryItemRepository } from '../../src/repositories/inMemoryItemRepository.js';
import { ItemService } from '../../src/services/itemService.js';
import { NotFoundError } from '../../src/utils/httpErrors.js';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';

describe('ItemService', () => {
  /** @type {ItemService} */
  let service;
  /** @type {InMemoryItemRepository} */
  let repository;
  let currentTime;
  let nextId;

  beforeEach(() => {
    currentTime = new Date('2026-11-03T18:00:00.000Z');
    nextId = 0;
    repository = new InMemoryItemRepository();
    service = new ItemService({
      itemRepository: repository,
      now: () => currentTime,
      generateId: () => `id-${++nextId}`,
    });
  });

  it('creates an item with server generated id and timestamps', async () => {
    const item = await service.create({ name: 'Lamp', description: null, price: 10 });

    assert.deepEqual(item, {
      id: 'id-1',
      name: 'Lamp',
      description: null,
      price: 10,
      createdAt: '2026-11-03T18:00:00.000Z',
      updatedAt: '2026-11-03T18:00:00.000Z',
    });
    assert.deepEqual(await service.getById('id-1'), item);
  });

  it('lists items in creation order', async () => {
    await service.create({ name: 'First', description: null, price: 1 });
    currentTime = new Date('2026-11-03T18:01:00.000Z');
    await service.create({ name: 'Second', description: null, price: 2 });

    const names = (await service.list()).map((item) => item.name);
    assert.deepEqual(names, ['First', 'Second']);
  });

  it('updates fields and updatedAt but keeps id and createdAt', async () => {
    const created = await service.create({ name: 'Lamp', description: 'Old', price: 10 });
    currentTime = new Date('2026-11-03T19:00:00.000Z');

    const updated = await service.update(created.id, {
      name: 'Desk lamp',
      description: null,
      price: 12,
    });

    assert.equal(updated.id, created.id);
    assert.equal(updated.createdAt, created.createdAt);
    assert.equal(updated.updatedAt, '2026-11-03T19:00:00.000Z');
    assert.equal(updated.name, 'Desk lamp');
    assert.equal(updated.description, null);
    assert.equal(updated.price, 12);
  });

  it('removes an item', async () => {
    const created = await service.create({ name: 'Lamp', description: null, price: 10 });

    await service.remove(created.id);

    await assert.rejects(service.getById(created.id), NotFoundError);
  });

  it('throws NotFoundError for unknown ids', async () => {
    const input = { name: 'Lamp', description: null, price: 1 };

    await assert.rejects(service.getById(MISSING_ID), NotFoundError);
    await assert.rejects(service.update(MISSING_ID, input), NotFoundError);
    await assert.rejects(service.remove(MISSING_ID), {
      name: 'NotFoundError',
      status: 404,
      message: `Item with id '${MISSING_ID}' was not found.`,
    });
  });

  it('throws NotFoundError if the item disappears during an update', async () => {
    const created = await service.create({ name: 'Lamp', description: null, price: 10 });
    // Simula un'eliminazione concorrente tra la lettura e la scrittura.
    repository.update = async () => null;

    await assert.rejects(service.update(created.id, { name: 'X', price: 1 }), NotFoundError);
  });
});
