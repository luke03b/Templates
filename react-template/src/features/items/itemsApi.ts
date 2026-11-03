// Servizio API della risorsa items: una funzione per ogni endpoint del contratto.
// Non contiene stato ne' logica UI: solo trasporto, via il client HTTP centrale.

import { http } from '@/api/httpClient';

import type { Item, ItemInput } from './itemTypes';

const BASE = '/items';

export const itemsApi = {
  list: (signal?: AbortSignal) => http.get<Item[]>(BASE, signal),
  get: (id: string, signal?: AbortSignal) =>
    http.get<Item>(`${BASE}/${encodeURIComponent(id)}`, signal),
  create: (input: ItemInput) => http.post<Item>(BASE, input),
  update: (id: string, input: ItemInput) =>
    http.put<Item>(`${BASE}/${encodeURIComponent(id)}`, input),
  remove: (id: string) => http.delete(`${BASE}/${encodeURIComponent(id)}`),
};
