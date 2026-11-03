// Helper per i test di integrazione: crea un'app nuova (dati freschi a ogni test) con logger silenzioso.
import pino from 'pino';
import { createApp } from '../../src/app.js';
import { loadConfig } from '../../src/config/env.js';

/**
 * @param {Partial<Parameters<typeof createApp>[0]>} [overrides]
 */
export function buildTestApp(overrides = {}) {
  return createApp({
    config: loadConfig({ NODE_ENV: 'test' }),
    logger: pino({ level: 'silent' }),
    ...overrides,
  });
}
