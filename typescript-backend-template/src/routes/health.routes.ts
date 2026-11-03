/** Rotte dell'health check (montate sotto /api). */
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { HealthController } from '../controllers/health.controller.ts';
import { getHealthSchema } from '../schemas/health.schema.ts';

export interface HealthRoutesOptions {
  controller: HealthController;
}

export const healthRoutes: FastifyPluginAsyncTypebox<HealthRoutesOptions> = async (
  app,
  { controller },
) => {
  app.get('/health', { schema: getHealthSchema }, controller.get);
};
