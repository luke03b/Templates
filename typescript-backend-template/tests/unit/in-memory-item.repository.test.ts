/** Unit test del repository in memoria. */
import { describe, expect, it } from 'vitest';
import {
  createSeedItems,
  InMemoryItemRepository,
} from '../../src/repositories/in-memory-item.repository.ts';

describe('InMemoryItemRepository', () => {
  it('starts with the 3 seed items sorted by createdAt', async () => {
    const items = await new InMemoryItemRepository().findAll();

    expect(items).toHaveLength(3);
    const times = items.map((item) => item.createdAt.getTime());
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it('returns copies so callers cannot mutate the stored state', async () => {
    const repository = new InMemoryItemRepository(createSeedItems());
    const [first] = await repository.findAll();
    if (!first) throw new Error('seed is empty');

    first.name = 'mutated';

    expect((await repository.findById(first.id))?.name).not.toBe('mutated');
  });

  it('returns undefined/false for unknown ids', async () => {
    const repository = new InMemoryItemRepository([]);
    const now = new Date();
    const ghost = {
      id: 'x',
      name: 'x',
      description: null,
      price: 0,
      createdAt: now,
      updatedAt: now,
    };

    expect(await repository.findById('x')).toBeUndefined();
    expect(await repository.update(ghost)).toBeUndefined();
    expect(await repository.delete('x')).toBe(false);
  });
});
