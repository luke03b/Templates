// Client API unico e tipizzato: l'UNICO punto dell'app che parla con il backend.
// Ogni metodo restituisce un Observable tipizzato; gli errori arrivano gia' come ApiError
// grazie a errorInterceptor.
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api-config';
import { HealthStatus } from '../models/health';
import { Item, ItemInput } from '../models/item';
import { silentErrors } from './http-context';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** GET /api/health. Errori silenziosi: l'offline e' mostrato dall'indicatore di stato. */
  getHealth(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(this.url('health'), { context: silentErrors() });
  }

  /** GET /api/items */
  listItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.url('items'));
  }

  /** GET /api/items/{id} */
  getItem(id: string): Observable<Item> {
    return this.http.get<Item>(this.url('items', id));
  }

  /** POST /api/items -> 201 */
  createItem(input: ItemInput): Observable<Item> {
    return this.http.post<Item>(this.url('items'), input);
  }

  /** PUT /api/items/{id} -> 200 */
  updateItem(id: string, input: ItemInput): Observable<Item> {
    return this.http.put<Item>(this.url('items', id), input);
  }

  /** DELETE /api/items/{id} -> 204 senza corpo */
  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(this.url('items', id));
  }

  /** Compone l'URL codificando i segmenti (evita problemi con caratteri speciali negli id). */
  private url(...segments: string[]): string {
    return [this.baseUrl, ...segments.map(encodeURIComponent)].join('/');
  }
}
