// Unit test del repository in memoria.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { InMemoryItemRepository } from '../../src/repositories/inMemoryItemRepository.js';

const item = (id, createdAt) => ({
  id,
  name: `Item ${id}`,
  description: null,
  price: 1,
  createdAt,
  updatedAt: createdAt,
});

describe('InMemoryItemRepository', () => {
  it('returns items sorted by createdAt', async () => {
    const repository = new InMemoryItemRepository([
      item('b', '2026-01-02T00:00:00.000Z'),
      item('a', '2026-01-01T00:00:00.000Z'),
    ]);

    const ids = (await repository.findAll()).map((i) => i.id);
    assert.deepEqual(ids, ['a', 'b']);
  });

  it('returns copies so callers cannot mutate stored data', async () => {
    const repository = new InMemoryItemRepository([item('a', '2026-01-01T00:00:00.000Z')]);

    const found = await repository.findById('a');
    found.name = 'changed';

    assert.equal((await repository.findById('a')).name, 'Item a');
  });

  it('returns null / false for unknown ids', async () => {
    const repository = new InMemoryItemRepository();

    assert.equal(await repository.findById('missing'), null);
    assert.equal(await repository.update(item('missing', '2026-01-01T00:00:00.000Z')), null);
    assert.equal(await repository.delete('missing'), false);
  });

  it('creates, updates and deletes items', async () => {
    const repository = new InMemoryItemRepository();
    await repository.create(item('a', '2026-01-01T00:00:00.000Z'));

    const updated = await repository.update({ ...item('a', '2026-01-01T00:00:00.000Z'), price: 5 });
    assert.equal(updated.price, 5);

    assert.equal(await repository.delete('a'), true);
    assert.deepEqual(await repository.findAll(), []);
  });
});
