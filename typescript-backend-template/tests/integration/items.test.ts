/** Test di integrazione HTTP del CRUD /api/items (successi ed errori) tramite app.inject(). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { App } from '../../src/app.ts';
import { InMemoryItemRepository } from '../../src/repositories/in-memory-item.repository.ts';
import type { ItemRepository } from '../../src/repositories/item.repository.ts';
import type { ItemDto } from '../../src/schemas/item.schema.ts';
import { buildTestApp } from '../helpers/test-app.ts';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

interface Problem {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: Record<string, string[]>;
}

describe('/api/items', () => {
  let app: App;

  // Un'app nuova per ogni test: lo stato in memoria non "sporca" i test successivi.
  beforeEach(async () => {
    app = await buildTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  const createItem = (payload: unknown) =>
    app.inject({ method: 'POST', url: '/api/items', payload: payload as object });

  describe('GET /api/items', () => {
    it('returns the 3 seed items sorted by createdAt', async () => {
      const response = await app.inject({ method: 'GET', url: '/api/items' });

      expect(response.statusCode).toBe(200);
      const items = response.json<ItemDto[]>();
      expect(items).toHaveLength(3);
      const created = items.map((item) => item.createdAt);
      expect(created).toEqual([...created].sort());
    });
  });

  describe('GET /api/items/:id', () => {
    it('returns an existing item', async () => {
      const [first] = (await app.inject({ method: 'GET', url: '/api/items' })).json<ItemDto[]>();

      const response = await app.inject({ method: 'GET', url: `/api/items/${first?.id ?? ''}` });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(first);
    });

    it('returns 404 Problem Details for an unknown id', async () => {
      const response = await app.inject({ method: 'GET', url: `/api/items/${UNKNOWN_ID}` });

      expect(response.statusCode).toBe(404);
      expect(response.headers['content-type']).toContain('application/problem+json');
      expect(response.json()).toEqual({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        detail: `Item with id '${UNKNOWN_ID}' was not found.`,
      });
    });
  });

  describe('POST /api/items', () => {
    it('creates an item and returns 201 with Location header', async () => {
      const response = await createItem({ name: '  Desk  ', description: 'Oak', price: 120 });

      expect(response.statusCode).toBe(201);
      const item = response.json<ItemDto>();
      expect(item).toMatchObject({ name: 'Desk', description: 'Oak', price: 120 });
      expect(item.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(item.createdAt).toBe(item.updatedAt);
      expect(response.headers.location).toBe(`/api/items/${item.id}`);

      const fetched = await app.inject({ method: 'GET', url: `/api/items/${item.id}` });
      expect(fetched.json()).toEqual(item);
    });

    it('defaults description to null and ignores unknown fields', async () => {
      const response = await createItem({ name: 'Pen', price: 0, id: 'hacked', extra: true });

      expect(response.statusCode).toBe(201);
      const item = response.json<ItemDto & { extra?: unknown }>();
      expect(item.description).toBeNull();
      expect(item.id).not.toBe('hacked');
      expect(item.extra).toBeUndefined();
    });

    it('returns 400 with field errors for missing fields', async () => {
      const response = await createItem({});

      expect(response.statusCode).toBe(400);
      expect(response.headers['content-type']).toContain('application/problem+json');
      expect(response.json()).toEqual({
        type: 'about:blank',
        title: 'Validation failed',
        status: 400,
        detail: 'One or more fields are invalid.',
        errors: {
          name: ['name is required'],
          price: ['price is required'],
        },
      });
    });

    it.each([
      [{ name: '   ', price: 1 }, 'name', 'name must not be empty'],
      [{ name: 'x'.repeat(101), price: 1 }, 'name', 'name must be at most 100 characters long'],
      [
        { name: 'Pen', description: 'x'.repeat(501), price: 1 },
        'description',
        'description must be at most 500 characters long',
      ],
      [
        { name: 'Pen', description: 42, price: 1 },
        'description',
        'description must be of type string or null',
      ],
      [{ name: 'Pen', price: -1 }, 'price', 'price must be greater than or equal to 0'],
      [{ name: 'Pen', price: '10' }, 'price', 'price must be of type number'],
    ])('rejects %o', async (payload, field, message) => {
      const response = await createItem(payload);

      expect(response.statusCode).toBe(400);
      expect(response.json<Problem>().errors?.[field]).toEqual([message]);
    });

    it('returns 400 Problem Details for malformed JSON', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/items',
        headers: { 'content-type': 'application/json' },
        payload: '{"name": ',
      });

      expect(response.statusCode).toBe(400);
      const problem = response.json<Problem>();
      expect(problem.title).toBe('Validation failed');
      expect(problem.errors?.body).toHaveLength(1);
    });
    it('returns 415 Problem Details for an unsupported content type', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/items',
        headers: { 'content-type': 'application/xml' },
        payload: '<item><name>Pen</name></item>',
      });

      expect(response.statusCode).toBe(415);
      expect(response.json<Problem>()).toMatchObject({
        title: 'Unsupported Media Type',
        status: 415,
      });
    });
  });

  describe('PUT /api/items/:id', () => {
    it('replaces the item and refreshes updatedAt', async () => {
      const created = (
        await createItem({ name: 'Lamp', description: 'Old', price: 10 })
      ).json<ItemDto>();
      await new Promise((resolve) => setTimeout(resolve, 5));

      const response = await app.inject({
        method: 'PUT',
        url: `/api/items/${created.id}`,
        payload: { name: 'Desk lamp', price: 15 },
      });

      expect(response.statusCode).toBe(200);
      const updated = response.json<ItemDto>();
      expect(updated).toMatchObject({
        id: created.id,
        name: 'Desk lamp',
        description: null,
        price: 15,
      });
      expect(updated.createdAt).toBe(created.createdAt);
      expect(Date.parse(updated.updatedAt)).toBeGreaterThan(Date.parse(created.updatedAt));
    });

    it('returns 400 for an invalid body', async () => {
      const [first] = (await app.inject({ method: 'GET', url: '/api/items' })).json<ItemDto[]>();

      const response = await app.inject({
        method: 'PUT',
        url: `/api/items/${first?.id ?? ''}`,
        payload: { name: '', price: -5 },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json<Problem>().errors).toEqual({
        name: ['name must not be empty'],
        price: ['price must be greater than or equal to 0'],
      });
    });

    it('returns 404 for an unknown id', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/api/items/${UNKNOWN_ID}`,
        payload: { name: 'Ghost', price: 1 },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json<Problem>().errors).toBeUndefined();
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('deletes the item and returns 204 without body', async () => {
      const created = (await createItem({ name: 'Temp', price: 1 })).json<ItemDto>();

      const response = await app.inject({ method: 'DELETE', url: `/api/items/${created.id}` });

      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');
      const fetched = await app.inject({ method: 'GET', url: `/api/items/${created.id}` });
      expect(fetched.statusCode).toBe(404);
    });

    it('returns 404 for an unknown id', async () => {
      const response = await app.inject({ method: 'DELETE', url: `/api/items/${UNKNOWN_ID}` });

      expect(response.statusCode).toBe(404);
    });
  });
});

describe('unexpected errors', () => {
  it('returns a generic 500 Problem Details without leaking internals', async () => {
    // Repository che fallisce sempre: simula, ad esempio, un database irraggiungibile.
    const failing = new InMemoryItemRepository([]);
    failing.findAll = () => Promise.reject(new Error('connection refused to db at 10.0.0.5'));
    const app = await buildTestApp({ itemRepository: failing satisfies ItemRepository });

    const response = await app.inject({ method: 'GET', url: '/api/items' });
    await app.close();

    expect(response.statusCode).toBe(500);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.json()).toEqual({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred.',
    });
    expect(response.body).not.toContain('10.0.0.5');
  });
});

describe('trailing slash', () => {
  it('treats /api/items/ like /api/items', async () => {
    const app = await buildTestApp();
    const response = await app.inject({ method: 'GET', url: '/api/items/' });
    await app.close();

    expect(response.statusCode).toBe(200);
  });
});
