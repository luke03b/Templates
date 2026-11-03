/**
 * Gestione centralizzata degli errori e delle rotte inesistenti.
 *
 * Ogni errore, da qualsiasi rotta, arriva qui e diventa una risposta Problem Details:
 * - errori di validazione Fastify/Ajv  -> 400 con `errors` per campo;
 * - AppError (NotFoundError, ...)      -> il loro status code;
 * - altri errori client di Fastify (JSON malformato, body troppo grande, ...) -> il loro 4xx;
 * - qualsiasi altra cosa               -> 500 generico, dettagli SOLO nei log.
 *
 * `fastify-plugin` (fp) serve a "rompere l'incapsulamento" di Fastify: senza fp un
 * plugin vale solo per le rotte registrate al suo interno; con fp vale per tutta l'app.
 */
import type { FastifyError, FastifyInstance, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { AppError, ValidationError } from '../errors/app-error.ts';
import {
  createProblem,
  PROBLEM_CONTENT_TYPE,
  type ProblemDetails,
} from '../errors/problem-details.ts';
import { toFieldErrors } from '../errors/validation-errors.ts';

function sendProblem(reply: FastifyReply, problem: ProblemDetails): FastifyReply {
  return reply.code(problem.status).type(PROBLEM_CONTENT_TYPE).send(problem);
}

function errorHandlerPlugin(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    // 1. Validazione dello schema (body, params, querystring, headers).
    if (error.validation) {
      const fieldErrors = toFieldErrors(error.validation, error.validationContext);
      const validationError = new ValidationError(fieldErrors);
      return sendProblem(
        reply,
        createProblem(400, validationError.message, {
          title: validationError.title,
          errors: validationError.errors,
        }),
      );
    }

    // 2. Errori applicativi attesi.
    if (error instanceof AppError) {
      const errors = error instanceof ValidationError ? error.errors : undefined;
      return sendProblem(
        reply,
        createProblem(error.statusCode, error.message, {
          title: error.title,
          ...(errors ? { errors } : {}),
        }),
      );
    }

    // 3. Errori client generati da Fastify stesso (es. FST_ERR_CTP_INVALID_JSON_BODY).
    //    I loro messaggi sono pensati per il client e non contengono dati sensibili.
    const statusCode = error.statusCode ?? 500;
    if (statusCode >= 400 && statusCode < 500) {
      request.log.info({ err: error }, 'client error');
      if (statusCode === 400) {
        return sendProblem(
          reply,
          createProblem(400, error.message, {
            title: 'Validation failed',
            errors: { body: [error.message] },
          }),
        );
      }
      return sendProblem(reply, createProblem(statusCode, error.message));
    }

    // 4. Errore inatteso: log completo (con stack) lato server, messaggio generico al client.
    request.log.error({ err: error }, 'unhandled error');
    return sendProblem(reply, createProblem(500, 'An unexpected error occurred.'));
  });

  app.setNotFoundHandler((request, reply) =>
    sendProblem(reply, createProblem(404, `Route ${request.method} ${request.url} not found.`)),
  );
}

export default fp(errorHandlerPlugin, { name: 'error-handler' });
