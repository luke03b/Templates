/**
 * Logica di business della risorsa Item (casi d'uso).
 *
 * Il service non sa nulla di HTTP: riceve dati gia' validati dal layer di ingresso,
 * applica le regole (generazione id e timestamp, normalizzazione) e lancia errori
 * applicativi (NotFoundError) che l'error handler globale traduce in risposte HTTP.
 */
import { randomUUID } from 'node:crypto';
import { NotFoundError } from '../errors/app-error.ts';
import type { Item, ItemRepository } from '../repositories/item.repository.ts';
import type { ItemInput } from '../schemas/item.schema.ts';

/** Dipendenze del service: iniettarle dal costruttore rende il service facile da testare. */
export interface ItemServiceDeps {
  repository: ItemRepository;
  /** Orologio sostituibile nei test per avere timestamp deterministici. */
  now?: () => Date;
  /** Generatore di id sostituibile nei test. */
  generateId?: () => string;
}

export class ItemService {
  // Campi espliciti invece delle "parameter properties" (constructor(private repo)):
  // quella sintassi non e' supportata dal type stripping nativo di Node.
  readonly #repository: ItemRepository;
  readonly #now: () => Date;
  readonly #generateId: () => string;

  constructor({ repository, now = () => new Date(), generateId = randomUUID }: ItemServiceDeps) {
    this.#repository = repository;
    this.#now = now;
    this.#generateId = generateId;
  }

  list(): Promise<Item[]> {
    return this.#repository.findAll();
  }

  async getById(id: string): Promise<Item> {
    const item = await this.#repository.findById(id);
    if (!item) throw new NotFoundError('Item', id);
    return item;
  }

  async create(input: ItemInput): Promise<Item> {
    const timestamp = this.#now();
    return this.#repository.create({
      id: this.#generateId(),
      ...normalize(input),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  async update(id: string, input: ItemInput): Promise<Item> {
    const existing = await this.getById(id);
    const updated = await this.#repository.update({
      ...existing,
      ...normalize(input),
      updatedAt: this.#now(),
    });
    // Puo' succedere solo se l'item e' stato eliminato nel frattempo.
    if (!updated) throw new NotFoundError('Item', id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.#repository.delete(id);
    if (!deleted) throw new NotFoundError('Item', id);
  }
}

/** PUT sostituisce tutta la risorsa: una description assente diventa null. */
function normalize(input: ItemInput): Pick<Item, 'name' | 'description' | 'price'> {
  return {
    name: input.name.trim(),
    description: input.description ?? null,
    price: input.price,
  };
}
