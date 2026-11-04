// Test dello store items con ApiClient finto.
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ApiClient } from '../../core/http/api-client';
import { ApiError } from '../../core/http/problem-details';
import { Item } from '../../core/models/item';
import { ItemsStore } from './items-store';

const ITEM: Item = {
  id: '1',
  name: 'Keyboard',
  description: null,
  price: 10,
  createdAt: '2026-11-03T18:00:00Z',
  updatedAt: '2026-11-03T18:00:00Z',
};

describe('ItemsStore', () => {
  const api = {
    listItems: vi.fn(),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
  };
  let store: ItemsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ItemsStore, { provide: ApiClient, useValue: api }],
    });
    store = TestBed.inject(ItemsStore);
  });

  it('loads items', async () => {
    api.listItems.mockReturnValue(of([ITEM]));
    await store.load();
    expect(store.items()).toEqual([ITEM]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('exposes the error message when loading fails', async () => {
    api.listItems.mockReturnValue(throwError(() => new ApiError(500, 'Internal Server Error')));
    await store.load();
    expect(store.error()).toBe('Internal Server Error');
  });

  it('creates, updates and removes items in the cache', async () => {
    api.listItems.mockReturnValue(of([]));
    await store.load();

    api.createItem.mockReturnValue(of(ITEM));
    await store.create({ name: 'Keyboard', price: 10 });
    expect(store.items()).toEqual([ITEM]);

    api.updateItem.mockReturnValue(of({ ...ITEM, name: 'Mouse' }));
    await store.update('1', { name: 'Mouse', price: 10 });
    expect(store.items()[0].name).toBe('Mouse');

    api.deleteItem.mockReturnValue(of(undefined));
    await store.remove('1');
    expect(store.isEmpty()).toBe(true);
  });
});
