// Tipi (DTO) della risorsa "items", identici al contratto API (docs/api-contract.md).

/** Item come restituito dal backend. */
export interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
}

/** Corpo per creazione (POST) e aggiornamento (PUT). */
export interface ItemInput {
  name: string;
  description?: string | null;
  price: number;
}
