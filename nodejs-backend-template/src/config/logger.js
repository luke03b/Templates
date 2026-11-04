// Creazione del logger strutturato (pino): ogni riga di log e' un oggetto JSON,
// facile da cercare e filtrare in produzione. In sviluppo "npm run dev" lo rende leggibile con pino-pretty.
import pino from 'pino';

/**
 * @param {Pick<import('./env.js').AppConfig, 'logLevel' | 'serviceName'>} config
 * @returns {import('pino').Logger}
 */
export function createLogger(config) {
  return pino({
    level: config.logLevel,
    // Campi aggiunti a ogni riga di log.
    base: { service: config.serviceName },
    // Timestamp ISO 8601 invece dei millisecondi epoch: piu' leggibile.
    timestamp: pino.stdTimeFunctions.isoTime,
    // Il livello come testo ("info") invece che come numero (30).
    formatters: { level: (label) => ({ level: label }) },
    // Non scrivere mai nei log dati sensibili presenti negli header.
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
      censor: '[REDACTED]',
    },
  });
}
