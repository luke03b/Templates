// Test di integrazione HTTP del CRUD /api/items (successi ed errori).
// Ogni test crea una nuova app, quindi parte sempre dai 3 item di esempio.
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { buildTestApp } from '../helpers/testApp.js';

const SEED_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const MISSING_ID = '00000000-0000-4000-8000-000000000000';
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Verifica che la risposta sia un Problem Details con lo stato indicato. */
function assertProblem(response, status) {
  assert.equal(response.status, status);
  assert.match(response.headers['content-type'], /^application\/problem\+json/);
  assert.equal(response.body.type, 'about:blank');
  assert.equal(response.body.status, status);
  assert.equal(typeof response.body.title, 'string');
  assert.equal(typeof response.body.detail, 'string');
}

describe('/api/items', () => {
  let app;

  beforeEach(() => {
    app = buildTestApp();
  });

  describe('GET /api/items', () => {
    it('returns the 3 seed items sorted by createdAt', async () => {
      const response = await request(app).get('/api/items');

      assert.equal(response.status, 200);
      assert.equal(response.body.length, 3);
      const createdAt = response.body.map((item) => item.createdAt);
      assert.deepEqual(createdAt, [...createdAt].sort());
      for (const item of response.body) {
        assert.deepEqual(Object.keys(item).sort(), [
          'createdAt',
          'description',
          'id',
          'name',
          'price',
          'updatedAt',
        ]);
      }
    });
  });

  describe('GET /api/items/:id', () => {
    it('returns an existing item', async () => {
      const response = await request(app).get(`/api/items/${SEED_ID}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.id, SEED_ID);
    });

    it('returns 404 Problem Details without errors for an unknown id', async () => {
      const response = await request(app).get(`/api/items/${MISSING_ID}`);

      assertProblem(response, 404);
      assert.equal(response.body.title, 'Not Found');
      assert.equal(response.body.errors, undefined);
    });
  });

  describe('POST /api/items', () => {
    it('creates an item and returns 201 with Location', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: '  Monitor  ', description: '27 inch', price: 199.99 });

      assert.equal(response.status, 201);
      assert.match(response.body.id, UUID_V4);
      assert.equal(response.headers.location, `/api/items/${response.body.id}`);
      assert.equal(response.body.name, 'Monitor');
      assert.equal(response.body.description, '27 inch');
      assert.equal(response.body.price, 199.99);
      assert.equal(response.body.createdAt, response.body.updatedAt);

      const list = await request(app).get('/api/items');
      assert.equal(list.body.length, 4);
      assert.equal(list.body.at(-1).id, response.body.id);
    });

    it('defaults description to null and ignores server generated fields', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'Cable', price: 0, id: 'custom', createdAt: '2000-01-01T00:00:00Z' });

      assert.equal(response.status, 201);
      assert.equal(response.body.description, null);
      assert.notEqual(response.body.id, 'custom');
      assert.notEqual(response.body.createdAt, '2000-01-01T00:00:00Z');
    });

    it('returns 400 with field errors for invalid input', async () => {
      const response = await request(app).post('/api/items').send({ price: -1 });

      assertProblem(response, 400);
      assert.deepEqual(response.body, {
        type: 'about:blank',
        title: 'Validation failed',
        status: 400,
        detail: 'One or more fields are invalid.',
        errors: {
          name: ['name is required'],
          price: ['price must be greater than or equal to 0'],
        },
      });
    });

    it('returns 400 when the body is missing', async () => {
      const response = await request(app).post('/api/items');

      assertProblem(response, 400);
      assert.deepEqual(Object.keys(response.body.errors).sort(), ['name', 'price']);
    });

    it('returns 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/items')
        .set('Content-Type', 'application/json')
        .send('{"name": ');

      assertProblem(response, 400);
      assert.deepEqual(response.body.errors, { body: ['body must be valid JSON'] });
    });

    it('returns 413 for a body that is too large', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ name: 'x', description: 'y'.repeat(200_000), price: 1 });

      assertProblem(response, 413);
    });
  });

  describe('PUT /api/items/:id', () => {
    it('updates an existing item', async () => {
      const before = (await request(app).get(`/api/items/${SEED_ID}`)).body;

      const response = await request(app)
        .put(`/api/items/${SEED_ID}`)
        .send({ name: 'Updated keyboard', price: 99 });

      assert.equal(response.status, 200);
      assert.equal(response.body.id, SEED_ID);
      assert.equal(response.body.name, 'Updated keyboard');
      assert.equal(response.body.description, null);
      assert.equal(response.body.price, 99);
      assert.equal(response.body.createdAt, before.createdAt);
      assert.ok(response.body.updatedAt > before.updatedAt);
    });

    it('returns 400 for invalid input', async () => {
      const response = await request(app).put(`/api/items/${SEED_ID}`).send({ name: '', price: 1 });

      assertProblem(response, 400);
      assert.deepEqual(response.body.errors, { name: ['name must not be empty'] });
    });

    it('returns 404 for an unknown id', async () => {
      const response = await request(app)
        .put(`/api/items/${MISSING_ID}`)
        .send({ name: 'Ghost', price: 1 });

      assertProblem(response, 404);
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('deletes an item and returns 204 without body', async () => {
      const response = await request(app).delete(`/api/items/${SEED_ID}`);

      assert.equal(response.status, 204);
      assert.equal(response.text, '');
      assertProblem(await request(app).get(`/api/items/${SEED_ID}`), 404);
    });

    it('returns 404 for an unknown id', async () => {
      assertProblem(await request(app).delete(`/api/items/${MISSING_ID}`), 404);
    });
  });
});
