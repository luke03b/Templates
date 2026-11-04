/**
 * Punto di ingresso del processo: legge la configurazione, avvia il server HTTP
 * e gestisce lo spegnimento ordinato ("graceful shutdown").
 *
 * Graceful shutdown: quando Docker/Kubernetes o Ctrl+C inviano SIGTERM/SIGINT, smettiamo
 * di accettare nuove connessioni, lasciamo finire le richieste in corso (app.close())
 * e solo dopo usciamo. Un timer di sicurezza forza l'uscita se qualcosa resta appeso.
 */
import { buildApp } from './app.ts';
import { ConfigError, loadConfig } from './config/env.ts';

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function main(): Promise<void> {
  const config = loadConfig();
  const app = await buildApp({ config });

  let shuttingDown = false;
  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    app.log.info({ signal }, 'shutdown started');

    const forceExit = setTimeout(() => {
      app.log.error('shutdown timed out, forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    try {
      await app.close();
      app.log.info('shutdown completed');
      process.exit(0);
    } catch (error) {
      app.log.error({ err: error }, 'error during shutdown');
      process.exit(1);
    }
  };

  process.once('SIGINT', (signal) => void shutdown(signal));
  process.once('SIGTERM', (signal) => void shutdown(signal));

  // Un errore non gestito lascia il processo in uno stato incerto: lo logghiamo e usciamo,
  // sara' l'orchestratore (Docker restart policy, Kubernetes) a riavviarlo.
  process.on('unhandledRejection', (reason) => {
    app.log.fatal({ err: reason }, 'unhandled promise rejection');
    process.exit(1);
  });
  process.on('uncaughtException', (error) => {
    app.log.fatal({ err: error }, 'uncaught exception');
    process.exit(1);
  });

  await app.listen({ host: config.host, port: config.port });
  app.log.info({ docs: `http://localhost:${config.port}/docs` }, 'API documentation available');
}

main().catch((error: unknown) => {
  // Qui il logger potrebbe non esistere ancora (es. configurazione non valida).
  if (error instanceof ConfigError) {
    console.error(error.message);
  } else {
    console.error('Failed to start server', error);
  }
  process.exit(1);
});
