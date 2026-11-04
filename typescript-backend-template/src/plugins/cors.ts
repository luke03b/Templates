/**
 * CORS (Cross-Origin Resource Sharing): permette ai frontend serviti su un'altra
 * origine (es. http://localhost:5173) di chiamare questa API dal browser.
 * Le origini consentite arrivano dalla configurazione (CORS_ORIGINS), mai hardcoded.
 */
import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import type { AppConfig } from '../config/env.ts';

async function corsPlugin(app: FastifyInstance, options: { config: AppConfig }): Promise<void> {
  const { corsOrigins } = options.config;
  await app.register(cors, {
    origin: corsOrigins === true ? true : [...corsOrigins],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['Location', 'X-Request-Id'],
  });
}

export default fp(corsPlugin, { name: 'cors' });
