// Logica di business della risorsa "items": genera id e date, decide quando un item "non esiste".
// Il service non sa nulla di HTTP (niente req/res): riceve dati gia' validati e lancia errori
// applicativi (NotFoundError) che il middleware errorHandler trasforma in risposte HTTP.
// Le dipendenze (repository, orologio, generatore di id) arrivano dal costruttore:
// e' la "dependency injection", che permette di sostituirle facilmente nei test.
import { randomUUID } from 'node:crypto';
import { NotFoundError } from '../utils/httpErrors.js';

/** @typedef {import('../schemas/itemSchemas.js').Item} Item */
/** @typedef {import('../schemas/itemSchemas.js').ItemInput} ItemInput */

export class ItemService {
  #repository;
  #now;
  #generateId;

  /**
   * @param {object} deps
   * @param {import('../repositories/itemRepository.js').ItemRepository} deps.itemRepository
   * @param {() => Date} [deps.now] Orologio iniettabile.
   * @param {() => string} [deps.generateId] Generatore di id (default: UUID v4).
   */
  constructor({ itemRepository, now = () => new Date(), generateId = randomUUID }) {
    this.#repository = itemRepository;
    this.#now = now;
    this.#generateId = generateId;
  }

  /** @returns {Promise<Item[]>} */
  async list() {
    return this.#repository.findAll();
  }

  /**
   * @param {string} id
   * @returns {Promise<Item>}
   * @throws {NotFoundError}
   */
  async getById(id) {
    const item = await this.#repository.findById(id);
    if (!item) throw itemNotFound(id);
    return item;
  }

  /**
   * @param {ItemInput} input
   * @returns {Promise<Item>}
   */
  async create(input) {
    const timestamp = this.#now().toISOString();
    return this.#repository.create({
      id: this.#generateId(),
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  /**
   * Aggiornamento completo (semantica PUT): i campi omessi tornano al valore di default.
   * @param {string} id
   * @param {ItemInput} input
   * @returns {Promise<Item>}
   * @throws {NotFoundError}
   */
  async update(id, input) {
    const existing = await this.getById(id);
    const updated = await this.#repository.update({
      ...existing,
      name: input.name,
      description: input.description ?? null,
      price: input.price,
      updatedAt: this.#now().toISOString(),
    });
    // Puo' succedere se l'item viene eliminato tra la lettura e la scrittura.
    if (!updated) throw itemNotFound(id);
    return updated;
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   * @throws {NotFoundError}
   */
  async remove(id) {
    const deleted = await this.#repository.delete(id);
    if (!deleted) throw itemNotFound(id);
  }
}

/** @param {string} id */
function itemNotFound(id) {
  return new NotFoundError(`Item with id '${id}' was not found.`);
}
