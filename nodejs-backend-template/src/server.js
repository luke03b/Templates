// Punto di avvio: legge la configurazione, crea l'app, apre la porta HTTP e
// gestisce lo spegnimento "graceful" (smette di accettare connessioni, finisce quelle in corso, esce).
// Docker e i process manager inviano SIGTERM per fermare il processo; Ctrl+C invia SIGINT.
import { createServer } from 'node:http';
import { createApp } from './app.js';
import { ConfigError, loadConfig } from './config/env.js';
import { createLogger } from './config/logger.js';

/** @returns {import('./config/env.js').AppConfig} */
function loadConfigOrExit() {
  try {
    return loadConfig();
  } catch (error) {
    if (error instanceof ConfigError) {
      // Il logger non esiste ancora (dipende dalla config): scriviamo direttamente su stderr.
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    }
    throw error;
  }
}

const config = loadConfigOrExit();
const logger = createLogger(config);
const app = createApp({ config, logger });
const server = createServer(app);

server.on('error', (error) => {
  logger.fatal({ err: error }, 'HTTP server error');
  process.exit(1);
});

server.listen(config.port, () => {
  logger.info(
    { port: config.port, nodeEnv: config.nodeEnv },
    `Server listening on http://localhost:${config.port} (docs: /docs)`,
  );
});

let shuttingDown = false;

/** @param {NodeJS.Signals} signal */
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Shutting down gracefully');

  // Se le connessioni non si chiudono entro il timeout, forziamo l'uscita.
  // unref() evita che questo timer da solo tenga vivo il processo.
  setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, config.shutdownTimeoutMs).unref();

  // close() smette di accettare nuove connessioni e chiama la callback quando quelle aperte finiscono.
  server.close((error) => {
    if (error) {
      logger.error({ err: error }, 'Error while closing the HTTP server');
      process.exit(1);
    }
    logger.info('HTTP server closed');
    process.exit(0);
  });
  // Chiude subito le connessioni keep-alive inattive (altrimenti close() potrebbe aspettare a lungo).
  server.closeIdleConnections();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Ultima rete di sicurezza: un errore non gestito lascia il processo in uno stato incerto,
// quindi lo registriamo e usciamo (Docker/il process manager lo riavviera').
process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection');
  process.exit(1);
});
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  process.exit(1);
});
