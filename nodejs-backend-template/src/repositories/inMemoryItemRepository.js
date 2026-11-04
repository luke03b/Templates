// Implementazione in memoria del repository degli item (nessun database).
// I dati vivono in una Map e si azzerano a ogni riavvio. Contiene SOLO accesso ai dati:
// niente regole di business (quelle stanno nel service).

/** @typedef {import('../schemas/itemSchemas.js').Item} Item */
/** @typedef {import('./itemRepository.js').ItemRepository} ItemRepository */

/** @implements {ItemRepository} */
export class InMemoryItemRepository {
  /** I campi che iniziano con "#" sono privati: accessibili solo dall'interno della classe. */
  /** @type {Map<string, Item>} */
  #items = new Map();

  /** @param {Item[]} [initialItems] Item da caricare subito (es. i dati di esempio). */
  constructor(initialItems = []) {
    for (const item of initialItems) this.#items.set(item.id, { ...item });
  }

  async findAll() {
    // Copia + ordinamento: chi chiama non puo' modificare per sbaglio i dati salvati.
    return [...this.#items.values()]
      .map((item) => ({ ...item }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /** @param {string} id */
  async findById(id) {
    const item = this.#items.get(id);
    return item ? { ...item } : null;
  }

  /** @param {Item} item */
  async create(item) {
    this.#items.set(item.id, { ...item });
    return { ...item };
  }

  /** @param {Item} item */
  async update(item) {
    if (!this.#items.has(item.id)) return null;
    this.#items.set(item.id, { ...item });
    return { ...item };
  }

  /** @param {string} id */
  async delete(id) {
    return this.#items.delete(id);
  }
}
