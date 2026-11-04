// Test di integrazione della gestione centralizzata degli errori (404 di rotta e 500 senza leak).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { buildTestApp } from '../helpers/testApp.js';

describe('error handling', () => {
  it('returns 404 Problem Details for unknown routes', async () => {
    const response = await request(buildTestApp()).get('/api/does-not-exist');

    assert.equal(response.status, 404);
    assert.match(response.headers['content-type'], /^application\/problem\+json/);
    assert.deepEqual(response.body, {
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      detail: 'Route GET /api/does-not-exist not found.',
    });
  });

  it('returns a generic 500 without leaking internal details', async () => {
    // Repository finto che fallisce: simula ad esempio un database irraggiungibile.
    const failingRepository = {
      findAll: async () => {
        throw new Error('database password is hunter2');
      },
    };
    const app = buildTestApp({ itemRepository: /** @type {any} */ (failingRepository) });

    const response = await request(app).get('/api/items');

    assert.equal(response.status, 500);
    assert.match(response.headers['content-type'], /^application\/problem\+json/);
    assert.deepEqual(response.body, {
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred.',
    });
    assert.doesNotMatch(response.text, /hunter2|at .*\.js/);
  });
});
