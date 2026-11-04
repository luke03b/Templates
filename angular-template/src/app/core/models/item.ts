// DTO della risorsa "items", identici al contratto API (docs/api-contract.md).

/** Item restituito dal backend. Le date sono stringhe ISO 8601 UTC. */
export interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
}

/** Corpo inviato in POST /api/items e PUT /api/items/{id}. */
export interface ItemInput {
  name: string;
  description?: string | null;
  price: number;
}
