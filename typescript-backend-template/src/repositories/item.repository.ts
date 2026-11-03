/**
 * Contratto del repository degli Item.
 *
 * Il service dipende da questa INTERFACCIA, non dall'implementazione: per passare a un
 * database vero basta scrivere una nuova classe che implementa ItemRepository
 * (es. PostgresItemRepository) e passarla a buildApp(), senza toccare service e rotte.
 * I metodi sono asincroni (Promise) anche in memoria, cosi' la firma resta identica
 * quando dietro ci sara' I/O reale.
 */

/** Modello di dominio/persistenza. Usa Date (non stringhe): la conversione in ISO la fa il mapper. */
export interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemRepository {
  /** Tutti gli item ordinati per createdAt crescente. */
  findAll(): Promise<Item[]>;
  findById(id: string): Promise<Item | undefined>;
  /** Inserisce un nuovo item (l'id e' gia' generato dal service). */
  create(item: Item): Promise<Item>;
  /** Sostituisce un item esistente; restituisce undefined se non esiste. */
  update(item: Item): Promise<Item | undefined>;
  /** Elimina un item; restituisce false se non esisteva. */
  delete(id: string): Promise<boolean>;
}
