/**
 * Registro di tutte le rotte dell'API sotto il prefisso /api.
 * Per aggiungere una risorsa: crea il suo file in routes/ e registralo qui.
 */
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { HealthController } from '../controllers/health.controller.ts';
import type { ItemController } from '../controllers/item.controller.ts';
import { healthRoutes } from './health.routes.ts';
import { itemRoutes } from './item.routes.ts';

export interface ApiRoutesOptions {
  controllers: {
    health: HealthController;
    items: ItemController;
  };
}

export const apiRoutes: FastifyPluginAsyncTypebox<ApiRoutesOptions> = async (
  app,
  { controllers },
) => {
  await app.register(healthRoutes, { controller: controllers.health });
  await app.register(itemRoutes, { prefix: '/items', controller: controllers.items });
};
