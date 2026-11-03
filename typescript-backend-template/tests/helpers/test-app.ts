/** Helper per creare un'app isolata per i test di integrazione (nessuna porta aperta, log spenti). */
import { buildApp, type BuildAppOptions } from '../../src/app.ts';
import { loadConfig } from '../../src/config/env.ts';

export async function buildTestApp(options: BuildAppOptions = {}) {
  const app = await buildApp({
    config: loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent' }),
    logger: false,
    ...options,
  });
  await app.ready();
  return app;
}
