/**
 * Implementazione in memoria di ItemRepository, basata su una Map.
 * I dati si azzerano a ogni riavvio. All'avvio contiene 3 item di esempio.
 */
import type { Item, ItemRepository } from './item.repository.ts';

/** Restituisce sempre copie, cosi' chi chiama non puo' modificare lo stato interno per errore. */
const clone = (item: Item): Item => ({
  ...item,
  createdAt: new Date(item.createdAt),
  updatedAt: new Date(item.updatedAt),
});

export class InMemoryItemRepository implements ItemRepository {
  // "#" = campo privato nativo di JavaScript (privato anche a runtime, non solo per TypeScript).
  readonly #items = new Map<string, Item>();

  constructor(seed: readonly Item[] = createSeedItems()) {
    for (const item of seed) this.#items.set(item.id, clone(item));
  }

  async findAll(): Promise<Item[]> {
    return [...this.#items.values()]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(clone);
  }

  async findById(id: string): Promise<Item | undefined> {
    const item = this.#items.get(id);
    return item ? clone(item) : undefined;
  }

  async create(item: Item): Promise<Item> {
    this.#items.set(item.id, clone(item));
    return clone(item);
  }

  async update(item: Item): Promise<Item | undefined> {
    if (!this.#items.has(item.id)) return undefined;
    this.#items.set(item.id, clone(item));
    return clone(item);
  }

  async delete(id: string): Promise<boolean> {
    return this.#items.delete(id);
  }
}

/** I 3 item di esempio richiesti dal contratto, con createdAt distinti per un ordinamento stabile. */
export function createSeedItems(now: Date = new Date()): Item[] {
  const at = (minutesAgo: number): Date => new Date(now.getTime() - minutesAgo * 60_000);
  return [
    {
      id: '3f1c2b9e-7a4d-4c1e-9b2a-1d5e6f7a8b01',
      name: 'Mechanical keyboard',
      description: 'Compact 75% keyboard with hot-swappable switches.',
      price: 89.9,
      createdAt: at(30),
      updatedAt: at(30),
    },
    {
      id: '8a2d4e6f-1b3c-4d5e-8f7a-2b3c4d5e6f02',
      name: 'Wireless mouse',
      description: null,
      price: 29.5,
      createdAt: at(20),
      updatedAt: at(20),
    },
    {
      id: 'c4e6a8b0-2d4f-4a6c-9e8b-3c5d7e9f1a03',
      name: 'USB-C hub',
      description: '7-in-1 hub with HDMI, SD card reader and 100 W power delivery.',
      price: 39,
      createdAt: at(10),
      updatedAt: at(10),
    },
  ];
}
