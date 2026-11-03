// Stato della feature "items": lista in cache, loading ed errore, e azioni CRUD.
// Le pagine chiamano lo store; lo store chiama ApiClient (le pagine non fanno HTTP).
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiClient } from '../../core/http/api-client';
import { toApiError } from '../../core/http/problem-details';
import { Item, ItemInput } from '../../core/models/item';

/**
 * Non e' `providedIn: 'root'`: viene fornito in items.routes.ts, quindi esiste una sola istanza
 * condivisa dalle pagine della feature e viene caricato insieme a loro (lazy).
 */
@Injectable()
export class ItemsStore {
  private readonly api = inject(ApiClient);

  private readonly itemsState = signal<Item[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly items = this.itemsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  /** computed(): valore derivato, ricalcolato solo quando cambiano i signal che legge. */
  readonly isEmpty = computed(() => !this.loading() && this.items().length === 0);

  /** Carica (o ricarica) la lista. Gli errori finiscono nel signal `error`. */
  async load(): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set(null);
    try {
      this.itemsState.set(await firstValueFrom(this.api.listItems()));
    } catch (error) {
      this.errorState.set(toApiError(error).message);
    } finally {
      this.loadingState.set(false);
    }
  }

  /** Legge un item dal server (sempre aggiornato, utile per la pagina di modifica). */
  getById(id: string): Promise<Item> {
    return firstValueFrom(this.api.getItem(id));
  }

  /** Crea un item. Lancia ApiError (es. validazione 400) che la pagina mostra sul form. */
  async create(input: ItemInput): Promise<Item> {
    const created = await firstValueFrom(this.api.createItem(input));
    this.itemsState.update((items) => [...items, created]);
    return created;
  }

  async update(id: string, input: ItemInput): Promise<Item> {
    const updated = await firstValueFrom(this.api.updateItem(id, input));
    this.itemsState.update((items) => items.map((item) => (item.id === id ? updated : item)));
    return updated;
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.api.deleteItem(id));
    this.itemsState.update((items) => items.filter((item) => item.id !== id));
  }
}
