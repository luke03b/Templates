// Test del client API con HttpTestingController: nessuna chiamata di rete reale.
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { Item } from '../models/item';
import { ApiClient } from './api-client';
import { SKIP_ERROR_TOAST } from './http-context';

const ITEM: Item = {
  id: 'a1',
  name: 'Keyboard',
  description: null,
  price: 10,
  createdAt: '2026-11-03T18:00:00Z',
  updatedAt: '2026-11-03T18:00:00Z',
};

describe('ApiClient', () => {
  let api: ApiClient;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GET /api/health with silent errors', async () => {
    const result = firstValueFrom(api.getHealth());
    const req = http.expectOne('/api/health');
    expect(req.request.method).toBe('GET');
    expect(req.request.context.get(SKIP_ERROR_TOAST)).toBe(true);
    req.flush({ status: 'ok', service: 'test', timestamp: '2026-11-03T18:00:00Z' });
    expect((await result).status).toBe('ok');
  });

  it('GET /api/items', async () => {
    const result = firstValueFrom(api.listItems());
    http.expectOne({ method: 'GET', url: '/api/items' }).flush([ITEM]);
    expect(await result).toEqual([ITEM]);
  });

  it('GET /api/items/{id} encodes the id', async () => {
    const result = firstValueFrom(api.getItem('a/1'));
    http.expectOne({ method: 'GET', url: '/api/items/a%2F1' }).flush(ITEM);
    expect(await result).toEqual(ITEM);
  });

  it('POST /api/items sends the input', async () => {
    const input = { name: 'Keyboard', description: null, price: 10 };
    const result = firstValueFrom(api.createItem(input));
    const req = http.expectOne({ method: 'POST', url: '/api/items' });
    expect(req.request.body).toEqual(input);
    req.flush(ITEM, { status: 201, statusText: 'Created' });
    expect(await result).toEqual(ITEM);
  });

  it('PUT /api/items/{id}', async () => {
    const input = { name: 'New', price: 5 };
    const result = firstValueFrom(api.updateItem('a1', input));
    const req = http.expectOne({ method: 'PUT', url: '/api/items/a1' });
    expect(req.request.body).toEqual(input);
    req.flush({ ...ITEM, ...input });
    expect((await result).name).toBe('New');
  });

  it('DELETE /api/items/{id}', async () => {
    const result = firstValueFrom(api.deleteItem('a1'));
    http.expectOne({ method: 'DELETE', url: '/api/items/a1' }).flush(null, {
      status: 204,
      statusText: 'No Content',
    });
    expect(await result).toBeNull();
  });
});
