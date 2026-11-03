// Lettura e validazione della configurazione dalle variabili d'ambiente.
// La configurazione viene validata UNA volta all'avvio con zod: se un valore e' sbagliato
// l'applicazione si ferma subito con un messaggio chiaro, invece di fallire piu' tardi a runtime.
import { z } from 'zod';

/** Nome del servizio, restituito da GET /api/health e aggiunto a ogni riga di log. */
export const SERVICE_NAME = 'nodejs-backend-template';

/** Origini CORS predefinite: tutte le porte dev/docker dei frontend (vedi docs/api-contract.md). */
export const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4200',
  'http://localhost:5200',
  'http://localhost:5300',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'http://localhost:8084',
];

/** Livelli di log ammessi dal contratto comune. */
export const LOG_LEVELS = /** @type {const} */ (['debug', 'info', 'warn', 'error']);

// Schema delle variabili d'ambiente. Le env sono sempre stringhe: "z.coerce" le converte in numeri,
// ".default()" fornisce il valore quando la variabile manca, ".transform()" cambia la forma del dato.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CORS_ORIGINS: z
    .string()
    .default(DEFAULT_CORS_ORIGINS.join(','))
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().min(0).default(10_000),
});

/**
 * Configurazione dell'applicazione gia' validata e tipizzata.
 * @typedef {object} AppConfig
 * @property {'development' | 'production' | 'test'} nodeEnv
 * @property {number} port Porta HTTP.
 * @property {string[]} corsOrigins Origini CORS consentite ("*" = tutte).
 * @property {(typeof LOG_LEVELS)[number]} logLevel
 * @property {number} shutdownTimeoutMs Tempo massimo per il graceful shutdown.
 * @property {string} serviceName
 */

/** Errore lanciato quando la configurazione non e' valida. */
export class ConfigError extends Error {
  /** @param {string[]} problems Elenco leggibile dei problemi trovati. */
  constructor(problems) {
    super(`Invalid configuration:\n  - ${problems.join('\n  - ')}`);
    this.name = 'ConfigError';
    this.problems = problems;
  }
}

/**
 * Legge e valida la configurazione.
 * Riceve l'oggetto env come parametro (default: process.env) cosi' nei test si puo' passare
 * un oggetto qualsiasi senza modificare l'ambiente reale del processo.
 * @param {Record<string, string | undefined>} [env]
 * @returns {AppConfig}
 * @throws {ConfigError}
 */
export function loadConfig(env = process.env) {
  // Una variabile presente ma vuota (es. "PORT=") viene trattata come assente, cosi' vale il default.
  const cleanedEnv = Object.fromEntries(
    Object.entries(env).filter(([, value]) => value !== undefined && value.trim() !== ''),
  );

  const result = envSchema.safeParse(cleanedEnv);
  if (!result.success) {
    throw new ConfigError(
      result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }

  const parsed = result.data;
  return Object.freeze({
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    corsOrigins: parsed.CORS_ORIGINS,
    logLevel: parsed.LOG_LEVEL,
    shutdownTimeoutMs: parsed.SHUTDOWN_TIMEOUT_MS,
    serviceName: SERVICE_NAME,
  });
}
