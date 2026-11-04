// "Interfaccia" del repository degli item.
// JavaScript non ha le interface come TypeScript/Java: la descriviamo con un @typedef JSDoc.
// Qualsiasi oggetto con questi metodi puo' essere usato dal service (in memoria, PostgreSQL, MongoDB...):
// per passare a un database vero basta scrivere una nuova classe e passarla a createApp().
// Tutti i metodi sono async (restituiscono Promise) come lo sarebbero con un database reale.

/**
 * @typedef {import('../schemas/itemSchemas.js').Item} Item
 */

/**
 * @typedef {object} ItemRepository
 * @property {() => Promise<Item[]>} findAll Tutti gli item, ordinati per createdAt crescente.
 * @property {(id: string) => Promise<Item | null>} findById L'item con quell'id, oppure null.
 * @property {(item: Item) => Promise<Item>} create Salva un nuovo item.
 * @property {(item: Item) => Promise<Item | null>} update Sostituisce un item esistente (null se non esiste).
 * @property {(id: string) => Promise<boolean>} delete Elimina un item; false se non esisteva.
 */

export {};
