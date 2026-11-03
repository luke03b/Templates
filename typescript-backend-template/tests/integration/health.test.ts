/** Test di integrazione HTTP di health, documentazione, CORS e rotte inesistenti. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { App } from '../../src/app.ts';
import { buildTestApp } from '../helpers/test-app.ts';

describe('platform endpoints', () => {
  let app: App;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns the service status', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/health' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-request-id']).toBeTypeOf('string');
    const body = response.json<{ status: string; service: string; timestamp: string }>();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('typescript-backend-template');
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  it('serves the OpenAPI document and Swagger UI', async () => {
    const spec = await app.inject({ method: 'GET', url: '/docs/json' });
    expect(spec.statusCode).toBe(200);
    expect(Object.keys(spec.json<{ paths: object }>().paths)).toEqual(
      expect.arrayContaining(['/api/health', '/api/items', '/api/items/{id}']),
    );

    const ui = await app.inject({ method: 'GET', url: '/docs' });
    expect(ui.statusCode).toBe(200);
  });

  it('answers CORS preflight for an allowed frontend origin', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/api/items',
      headers: { origin: 'http://localhost:5173', 'access-control-request-method': 'POST' },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('does not allow unknown origins', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
      headers: { origin: 'http://evil.test' },
    });

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('returns Problem Details 404 for unknown routes', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/does-not-exist' });

    expect(response.statusCode).toBe(404);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.json()).toEqual({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
      detail: 'Route GET /api/does-not-exist not found.',
    });
  });
});
