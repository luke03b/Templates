/** Unit test del service: logica di business senza HTTP, con repository in memoria vuoto. */
import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundError } from '../../src/errors/app-error.ts';
import { InMemoryItemRepository } from '../../src/repositories/in-memory-item.repository.ts';
import { ItemService } from '../../src/services/item.service.ts';

describe('ItemService', () => {
  let clock: Date;
  let service: ItemService;

  beforeEach(() => {
    clock = new Date('2026-11-03T18:00:00.000Z');
    let counter = 0;
    service = new ItemService({
      repository: new InMemoryItemRepository([]),
      now: () => clock,
      generateId: () => `id-${String(++counter)}`,
    });
  });

  it('creates an item with generated id, timestamps and trimmed name', async () => {
    const item = await service.create({ name: '  Lamp  ', price: 10 });

    expect(item).toEqual({
      id: 'id-1',
      name: 'Lamp',
      description: null,
      price: 10,
      createdAt: clock,
      updatedAt: clock,
    });
  });

  it('lists items sorted by createdAt', async () => {
    await service.create({ name: 'First', price: 1 });
    clock = new Date('2026-11-03T19:00:00.000Z');
    await service.create({ name: 'Second', price: 2 });

    const names = (await service.list()).map((item) => item.name);
    expect(names).toEqual(['First', 'Second']);
  });

  it('updates fields and updatedAt but keeps createdAt', async () => {
    const created = await service.create({ name: 'Lamp', description: 'Old', price: 10 });
    clock = new Date('2026-11-04T08:00:00.000Z');

    const updated = await service.update(created.id, { name: 'Desk lamp', price: 12 });

    expect(updated.name).toBe('Desk lamp');
    expect(updated.description).toBeNull();
    expect(updated.price).toBe(12);
    expect(updated.createdAt).toEqual(created.createdAt);
    expect(updated.updatedAt).toEqual(clock);
  });

  it('deletes an item', async () => {
    const created = await service.create({ name: 'Lamp', price: 10 });

    await service.delete(created.id);

    await expect(service.getById(created.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it.each([
    ['getById', (s: ItemService) => s.getById('missing')],
    ['update', (s: ItemService) => s.update('missing', { name: 'X', price: 1 })],
    ['delete', (s: ItemService) => s.delete('missing')],
  ])('%s throws NotFoundError for an unknown id', async (_name, call) => {
    await expect(call(service)).rejects.toThrow(new NotFoundError('Item', 'missing'));
  });
});
