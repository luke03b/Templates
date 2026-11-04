// Test della Home: mostra lo stato del backend letto dallo store (mock con signal).
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { HealthStatus } from '../../core/models/health';
import { BackendStatus, BackendStatusStore } from '../../core/state/backend-status-store';
import { HomePage } from './home-page';

describe('HomePage', () => {
  const store = {
    status: signal<BackendStatus>('online'),
    health: signal<HealthStatus | null>({
      status: 'ok',
      service: 'nodejs-backend-template',
      timestamp: '2026-11-03T18:00:00Z',
    }),
    lastCheck: signal<Date | null>(new Date()),
    check: vi.fn(),
  };

  async function render(): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([]), { provide: BackendStatusStore, useValue: store }],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the online status and service name', async () => {
    const element = await render();
    expect(element.textContent).toContain('Online');
    expect(element.textContent).toContain('nodejs-backend-template');
  });

  it('shows the offline status and allows a new check', async () => {
    store.status.set('offline');
    store.health.set(null);
    const element = await render();

    expect(element.textContent).toContain('Offline');
    expect(element.textContent).toContain('The backend is not reachable');

    element.querySelector<HTMLButtonElement>('app-loading-button button')?.click();
    expect(store.check).toHaveBeenCalled();
  });
});
