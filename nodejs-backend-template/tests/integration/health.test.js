// Test di integrazione HTTP di GET /api/health, documentazione e middleware globali.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { buildTestApp } from '../helpers/testApp.js';

describe('GET /api/health', () => {
  it('returns the service status', async () => {
    const response = await request(buildTestApp()).get('/api/health');

    assert.equal(response.status, 200);
    assert.match(response.headers['content-type'], /application\/json/);
    assert.equal(response.body.status, 'ok');
    assert.equal(response.body.service, 'nodejs-backend-template');
    assert.ok(!Number.isNaN(Date.parse(response.body.timestamp)));
  });

  it('adds security headers and a request id', async () => {
    const response = await request(buildTestApp()).get('/api/health');

    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    assert.equal(response.headers['x-powered-by'], undefined);
    assert.ok(response.headers['x-request-id']);
  });

  it('reuses the incoming X-Request-Id', async () => {
    const response = await request(buildTestApp())
      .get('/api/health')
      .set('X-Request-Id', 'abc-123');

    assert.equal(response.headers['x-request-id'], 'abc-123');
  });
});

describe('CORS', () => {
  it('allows a configured frontend origin', async () => {
    const response = await request(buildTestApp())
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');

    assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:5173');
  });

  it('does not allow an unknown origin', async () => {
    const response = await request(buildTestApp())
      .get('/api/health')
      .set('Origin', 'http://evil.test');

    assert.equal(response.headers['access-control-allow-origin'], undefined);
  });

  it('answers preflight requests', async () => {
    const response = await request(buildTestApp())
      .options('/api/items')
      .set('Origin', 'http://localhost:4200')
      .set('Access-Control-Request-Method', 'POST');

    assert.equal(response.status, 204);
    assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:4200');
  });
});

describe('API docs', () => {
  it('serves the OpenAPI document', async () => {
    const response = await request(buildTestApp()).get('/docs/openapi.json');

    assert.equal(response.status, 200);
    assert.equal(response.body.openapi, '3.1.0');
    assert.ok(response.body.paths['/api/items/{id}']);
  });

  it('serves Swagger UI', async () => {
    const response = await request(buildTestApp()).get('/docs/');

    assert.equal(response.status, 200);
    assert.match(response.text, /swagger-ui/);
  });
});
