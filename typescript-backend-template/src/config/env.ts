/**
 * Configurazione dell'applicazione letta dalle variabili d'ambiente.
 *
 * Le variabili vengono validate UNA volta all'avvio con uno schema TypeBox: se un valore
 * non e' valido il processo si ferma subito con un messaggio chiaro, invece di fallire
 * piu' tardi in un punto difficile da capire ("fail fast").
 *
 * Il file .env (se presente) viene caricato da Node stesso con il flag --env-file-if-exists
 * (vedi gli script in package.json): non serve la libreria dotenv.
 */
import { Type, type Static } from 'typebox';
import { Value } from 'typebox/value';

/** Nome del servizio restituito da GET /api/health e usato nei log. */
export const SERVICE_NAME = 'typescript-backend-template';

/** Origini CORS di default: tutte le porte dev/docker dei frontend (vedi docs/api-contract.md). */
export const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4200',
  'http://localhost:5200',
  'http://localhost:5300',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'http://localhost:8084',
].join(',');

const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

/** Schema delle variabili d'ambiente accettate, con i rispettivi default. */
const EnvSchema = Type.Object({
  NODE_ENV: Type.Union(
    [Type.Literal('development'), Type.Literal('test'), Type.Literal('production')],
    { default: 'development' },
  ),
  HOST: Type.String({ minLength: 1, default: '0.0.0.0' }),
  PORT: Type.Integer({ minimum: 1, maximum: 65535, default: 3001 }),
  LOG_LEVEL: Type.Union(
    LOG_LEVELS.map((level) => Type.Literal(level)),
    { default: 'info' },
  ),
  CORS_ORIGINS: Type.String({ default: DEFAULT_CORS_ORIGINS }),
});

type Env = Static<typeof EnvSchema>;

export type LogLevel = (typeof LOG_LEVELS)[number];

/** Configurazione tipizzata usata dal resto dell'applicazione. */
export interface AppConfig {
  readonly nodeEnv: Env['NODE_ENV'];
  readonly host: string;
  readonly port: number;
  readonly logLevel: LogLevel;
  /** Lista di origini consentite; `true` significa "qualsiasi origine" (CORS_ORIGINS=*). */
  readonly corsOrigins: readonly string[] | true;
}

/** Errore lanciato quando la configurazione non e' valida. */
export class ConfigError extends Error {
  override readonly name = 'ConfigError';
}

/**
 * Legge e valida la configurazione.
 * Accetta l'oggetto env come parametro (default: process.env) cosi' i test possono
 * passare valori controllati senza toccare l'ambiente globale.
 */
export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  // Prendiamo solo le chiavi note e trattiamo le stringhe vuote ("PORT=") come "non impostate".
  const raw: Record<string, string> = {};
  for (const key of Object.keys(EnvSchema.properties)) {
    const value = source[key]?.trim();
    if (value) raw[key] = value;
  }

  // Default applica i valori di default, Convert trasforma "3001" -> 3001.
  const candidate = Value.Convert(EnvSchema, Value.Default(EnvSchema, raw));
  if (!Value.Check(EnvSchema, candidate)) {
    const details = Value.Errors(EnvSchema, candidate)
      .map((error) => `${error.instancePath.replace(/^\//, '') || 'env'} ${error.message}`)
      .join('; ');
    throw new ConfigError(`Invalid environment configuration: ${details}`);
  }

  return {
    nodeEnv: candidate.NODE_ENV,
    host: candidate.HOST,
    port: candidate.PORT,
    logLevel: candidate.LOG_LEVEL,
    corsOrigins: parseCorsOrigins(candidate.CORS_ORIGINS),
  };
}

function parseCorsOrigins(value: string): readonly string[] | true {
  if (value === '*') return true;
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
