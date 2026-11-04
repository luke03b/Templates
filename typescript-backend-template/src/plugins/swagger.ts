/**
 * Documentazione OpenAPI generata automaticamente dagli schemi delle rotte.
 * - JSON della specifica: GET /docs/json
 * - Swagger UI interattiva: GET /docs
 * Va registrato PRIMA delle rotte, perche' raccoglie gli schemi man mano che vengono definite.
 */
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { SERVICE_NAME } from '../config/env.ts';

async function swaggerPlugin(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: {
      // OpenAPI 3.1 e' allineato a JSON Schema: supporta `type: "null"` usato da TypeBox.
      openapi: '3.1.0',
      info: {
        title: SERVICE_NAME,
        description: 'REST API template built with Fastify, TypeBox, Vite and Vitest.',
        version: '1.0.0',
      },
      tags: [
        { name: 'health', description: 'Service status' },
        { name: 'items', description: 'Example in-memory CRUD resource' },
      ],
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });
}

export default fp(swaggerPlugin, { name: 'swagger' });
