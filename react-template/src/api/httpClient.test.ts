// Test del client HTTP: URL, corpo JSON, 204 e conversione degli errori Problem Details.
import { describe, expect, it, vi } from 'vitest';

import { jsonResponse } from '@/test/renderWithProviders';

import { ApiError, http, NETWORK_ERROR_STATUS } from './httpClient';

function mockFetch(response: Response | Error) {
  const fetchMock = vi.fn<typeof fetch>(() =>
    response instanceof Error ? Promise.reject(response) : Promise.resolve(response),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('httpClient', () => {
  it('prefixes the path with /api and parses JSON', async () => {
    const fetchMock = mockFetch(jsonResponse({ status: 'ok' }));

    await expect(http.get('/health')).resolves.toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/health',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('sends a JSON body with the right Content-Type', async () => {
    const fetchMock = mockFetch(jsonResponse({ id: '1' }, 201));

    await http.post('/items', { name: 'A', price: 1 });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(JSON.stringify({ name: 'A', price: 1 }));
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it('returns undefined on 204 No Content', async () => {
    mockFetch(new Response(null, { status: 204 }));
    await expect(http.delete('/items/1')).resolves.toBeUndefined();
  });

  it('throws ApiError with field errors for a Problem Details 400', async () => {
    mockFetch(
      jsonResponse(
        {
          type: 'about:blank',
          title: 'Validation failed',
          status: 400,
          detail: 'One or more fields are invalid.',
          errors: { name: ['name is required'] },
        },
        400,
        'application/problem+json',
      ),
    );

    const error = await http.post('/items', {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(400);
    expect((error as ApiError).message).toBe('One or more fields are invalid.');
    expect((error as ApiError).fieldErrors).toEqual({ name: ['name is required'] });
  });

  it('throws a generic ApiError when the error body is not Problem Details', async () => {
    mockFetch(
      new Response('Bad gateway', { status: 502, headers: { 'Content-Type': 'text/plain' } }),
    );

    await expect(http.get('/items')).rejects.toMatchObject({
      status: 502,
      message: 'Request failed with status 502.',
    });
  });

  it('converts network failures into an ApiError with status 0', async () => {
    mockFetch(new TypeError('Failed to fetch'));

    await expect(http.get('/health')).rejects.toMatchObject({ status: NETWORK_ERROR_STATUS });
  });
});
