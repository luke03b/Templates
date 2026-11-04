/**
 * Restituisce al client l'id della richiesta nell'header X-Request-Id.
 * Lo stesso id compare in ogni riga di log della richiesta (campo "reqId"),
 * cosi' un errore segnalato da un utente si ritrova subito nei log.
 */
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

function requestIdPlugin(app: FastifyInstance): void {
  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });
}

export default fp(requestIdPlugin, { name: 'request-id' });
