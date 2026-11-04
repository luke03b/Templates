/**
 * Factory dell'applicazione Fastify ("composition root").
 *
 * buildApp() crea e collega tutti i pezzi (repository -> service -> controller -> rotte)
 * ma NON apre nessuna porta: cosi' i test possono creare un'app isolata e chiamarla con
 * app.inject() (richieste HTTP simulate, senza rete). L'avvio vero sta in server.ts.
 */
import { randomUUID } from 'node:crypto';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify, { type FastifyServerOptions } from 'fastify';
import { type AppConfig, loadConfig, SERVICE_NAME } from './config/env.ts';
import { HealthController } from './controllers/health.controller.ts';
import { ItemController } from './controllers/item.controller.ts';
import corsPlugin from './plugins/cors.ts';
import errorHandlerPlugin from './plugins/error-handler.ts';
import requestIdPlugin from './plugins/request-id.ts';
import swaggerPlugin from './plugins/swagger.ts';
import { configureValidation } from './plugins/validation.ts';
import { InMemoryItemRepository } from './repositories/in-memory-item.repository.ts';
import type { ItemRepository } from './repositories/item.repository.ts';
import { apiRoutes } from './routes/index.ts';
import { HealthService } from './services/health.service.ts';
import { ItemService } from './services/item.service.ts';

export interface BuildAppOptions {
  /** Configurazione; se assente viene letta da process.env. */
  config?: AppConfig;
  /** Repository alternativo (es. database vero o mock nei test). */
  itemRepository?: ItemRepository;
  /** Opzioni del logger pino; `false` lo disattiva (utile nei test). */
  logger?: FastifyServerOptions['logger'];
}

export async function buildApp(options: BuildAppOptions = {}) {
  const config = options.config ?? loadConfig();

  const app = Fastify({
    // Fastify integra pino: log JSON strutturati, una riga per evento, con reqId.
    logger: options.logger ?? {
      level: config.logLevel,
      base: { service: SERVICE_NAME },
      // Mai scrivere nei log credenziali o cookie.
      redact: ['req.headers.authorization', 'req.headers.cookie'],
    },
    // Riusa l'id ricevuto da un proxy/gateway se presente, altrimenti ne genera uno.
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
    // Dietro un reverse proxy (nginx, Docker) legge l'IP reale da X-Forwarded-For.
    trustProxy: true,
    // "/api/items" e "/api/items/" sono la stessa rotta.
    routerOptions: { ignoreTrailingSlash: true },
  }).withTypeProvider<TypeBoxTypeProvider>();

  configureValidation(app);

  // Plugin trasversali (valgono per tutte le rotte).
  await app.register(errorHandlerPlugin);
  await app.register(requestIdPlugin);
  await app.register(corsPlugin, { config });
  await app.register(swaggerPlugin);

  // Composizione manuale delle dipendenze: semplice, esplicita e senza container DI.
  const itemService = new ItemService({
    repository: options.itemRepository ?? new InMemoryItemRepository(),
  });
  const controllers = {
    health: new HealthController(new HealthService(SERVICE_NAME)),
    items: new ItemController(itemService),
  };

  await app.register(apiRoutes, { prefix: '/api', controllers });

  return app;
}

/** Tipo dell'istanza restituita da buildApp (utile nei test). */
export type App = Awaited<ReturnType<typeof buildApp>>;
