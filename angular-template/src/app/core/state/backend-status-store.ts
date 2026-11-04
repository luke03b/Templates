// Stato globale (signal) della raggiungibilita' del backend, letto da toolbar e Home.
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiClient } from '../http/api-client';
import { HealthStatus } from '../models/health';

export type BackendStatus = 'checking' | 'online' | 'offline';

/**
 * Store basato su signal: un signal e' un valore reattivo; quando cambia, Angular aggiorna
 * automaticamente i template che lo leggono (nessun subscribe manuale).
 * I signal "scrivibili" restano privati; all'esterno si espongono versioni in sola lettura.
 */
@Injectable({ providedIn: 'root' })
export class BackendStatusStore {
  private readonly api = inject(ApiClient);

  private readonly statusState = signal<BackendStatus>('checking');
  private readonly healthState = signal<HealthStatus | null>(null);
  private readonly lastCheckState = signal<Date | null>(null);

  readonly status = this.statusState.asReadonly();
  readonly health = this.healthState.asReadonly();
  readonly lastCheck = this.lastCheckState.asReadonly();

  /** Interroga GET /api/health e aggiorna lo stato. Non lancia mai eccezioni. */
  async check(): Promise<void> {
    this.statusState.set('checking');
    try {
      const health = await firstValueFrom(this.api.getHealth());
      this.healthState.set(health);
      this.statusState.set(health.status === 'ok' ? 'online' : 'offline');
    } catch {
      this.healthState.set(null);
      this.statusState.set('offline');
    } finally {
      this.lastCheckState.set(new Date());
    }
  }
}
