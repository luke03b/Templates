/** Logica dell'health check: qui si aggiungerebbero eventuali controlli sulle dipendenze. */
import type { HealthResponse } from '../schemas/health.schema.ts';

export class HealthService {
  readonly #serviceName: string;
  readonly #now: () => Date;

  constructor(serviceName: string, now: () => Date = () => new Date()) {
    this.#serviceName = serviceName;
    this.#now = now;
  }

  getHealth(): HealthResponse {
    return { status: 'ok', service: this.#serviceName, timestamp: this.#now().toISOString() };
  }
}
