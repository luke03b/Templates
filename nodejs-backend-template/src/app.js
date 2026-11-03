// "Factory" dell'applicazione Express: costruisce e restituisce l'app SENZA metterla in ascolto.
// Cosi' i test possono crearne una nuova (con dipendenze finte o un logger silenzioso)
// e usarla con supertest, mentre server.js si occupa solo di avvio e spegnimento.
// Qui avviene anche la "composizione": si creano repository -> service -> controller -> router.
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { randomUUID } from 'node:crypto';

import { createHealthController } from './controllers/healthController.js';
import { createItemController } from './controllers/itemController.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { InMemoryItemRepository } from './repositories/inMemoryItemRepository.js';
import { createSeedItems } from './repositories/seedItems.js';
import { createDocsRouter } from './routes/docsRoutes.js';
import { createApiRouter } from './routes/index.js';
import { HealthService } from './services/healthService.js';
import { ItemService } from './services/itemService.js';

/**
 * @param {object} options
 * @param {import('./config/env.js').AppConfig} options.config
 * @param {import('pino').Logger} options.logger
 * @param {import('./repositories/itemRepository.js').ItemRepository} [options.itemRepository]
 *   Repository da usare; di default uno in memoria con i 3 item di esempio.
 * @returns {import('express').Express}
 */
export function createApp({
  config,
  logger,
  itemRepository = new InMemoryItemRepository(createSeedItems()),
}) {
  // --- Composizione delle dipendenze (dependency injection "a mano") ---
  const healthService = new HealthService({ serviceName: config.serviceName });
  const itemService = new ItemService({ itemRepository });
  const apiRouter = createApiRouter({
    healthController: createHealthController(healthService),
    itemController: createItemController(itemService),
  });

  const app = express();

  // --- Middleware globali (l'ordine conta: vengono eseguiti dall'alto verso il basso) ---

  // Log strutturato di ogni richiesta con un id di correlazione (header X-Request-Id).
  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const incoming = req.headers['x-request-id'];
        const id = typeof incoming === 'string' && incoming.length <= 128 ? incoming : randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
      },
      // 5xx -> error, 4xx -> warn, il resto -> info.
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
      // Registriamo solo i campi utili, non tutti gli header: log piu' corti e niente dati sensibili.
      serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
      // L'healthcheck di Docker chiama /api/health ogni 30 s: non riempiamo i log.
      autoLogging: { ignore: (req) => req.url === '/api/health' },
    }),
  );

  // Header HTTP di sicurezza (X-Content-Type-Options, CSP, ...). "upgrade-insecure-requests" e'
  // disattivato perche' in locale/Docker si usa HTTP e romperebbe gli asset di Swagger UI.
  app.use(
    helmet({
      contentSecurityPolicy: { directives: { upgradeInsecureRequests: null } },
    }),
  );

  // CORS: solo le origini configurate in CORS_ORIGINS ("*" = tutte).
  app.use(
    cors({
      origin: config.corsOrigins.includes('*') ? true : config.corsOrigins,
      exposedHeaders: ['Location', 'X-Request-Id'],
    }),
  );

  // Converte i corpi JSON in oggetti JavaScript (req.body). Limite di dimensione contro abusi.
  app.use(express.json({ limit: '100kb' }));

  // --- Rotte ---
  app.use('/api', apiRouter);
  app.use('/docs', createDocsRouter());

  // --- Gestione errori (sempre per ultima) ---
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
