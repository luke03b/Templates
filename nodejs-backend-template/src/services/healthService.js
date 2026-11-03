// Logica dello stato del servizio (GET /api/health).
// Qui si possono aggiungere controlli su dipendenze esterne (database, cache...) se servono.

/**
 * @typedef {object} HealthStatus
 * @property {'ok'} status
 * @property {string} service
 * @property {string} timestamp Data ISO 8601 UTC.
 */

export class HealthService {
  #serviceName;
  #now;

  /**
   * @param {object} deps
   * @param {string} deps.serviceName
   * @param {() => Date} [deps.now] Orologio iniettabile (utile nei test).
   */
  constructor({ serviceName, now = () => new Date() }) {
    this.#serviceName = serviceName;
    this.#now = now;
  }

  /** @returns {HealthStatus} */
  getHealth() {
    return { status: 'ok', service: this.#serviceName, timestamp: this.#now().toISOString() };
  }
}
