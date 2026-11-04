// Test dello store dello stato backend con ApiClient finto (mock).
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ApiClient } from '../http/api-client';
import { ApiError } from '../http/problem-details';
import { BackendStatusStore } from './backend-status-store';

describe('BackendStatusStore', () => {
  const api = { getHealth: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: ApiClient, useValue: api }] });
  });

  it('is online when /api/health answers ok', async () => {
    api.getHealth.mockReturnValue(of({ status: 'ok', service: 'svc', timestamp: 'now' }));
    const store = TestBed.inject(BackendStatusStore);

    await store.check();

    expect(store.status()).toBe('online');
    expect(store.health()?.service).toBe('svc');
    expect(store.lastCheck()).toBeInstanceOf(Date);
  });

  it('is offline when the request fails', async () => {
    api.getHealth.mockReturnValue(throwError(() => new ApiError(0, 'Network error')));
    const store = TestBed.inject(BackendStatusStore);

    await store.check();

    expect(store.status()).toBe('offline');
    expect(store.health()).toBeNull();
  });
});
