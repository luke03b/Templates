// Gestore centralizzato degli errori. In Express un middleware con 4 argomenti
// (err, req, res, next) e' un "error handler": riceve ogni errore lanciato nelle rotte.
// Con Express 5 anche le Promise rifiutate (async/await) arrivano qui automaticamente,
// quindi nei controller NON servono try/catch ne' wrapper tipo "asyncHandler".
import { STATUS_CODES } from 'node:http';
import { HttpError } from '../utils/httpErrors.js';
import { sendProblem } from '../utils/problemDetails.js';

/**
 * Errori generati da Express/body-parser (JSON malformato, body troppo grande, ...).
 * Hanno "status" e "expose: true" quando il messaggio e' sicuro da mostrare.
 * @typedef {Error & { status?: number, statusCode?: number, expose?: boolean, type?: string }} FrameworkError
 */

/**
 * @param {unknown} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorHandler(err, req, res, next) {
  // Se la risposta e' gia' partita non si puo' piu' cambiare: si delega a Express che chiude la connessione.
  if (res.headersSent) {
    next(err);
    return;
  }

  // 1) Errori applicativi attesi (NotFoundError, ValidationError, ...).
  if (err instanceof HttpError) {
    sendProblem(res, err);
    return;
  }

  // Cast JSDoc: diciamo all'editor che forma ci aspettiamo (puo' anche essere un valore qualsiasi).
  const frameworkError = /** @type {FrameworkError} */ (err ?? {});

  // 2) JSON malformato nel corpo della richiesta.
  if (frameworkError.type === 'entity.parse.failed') {
    sendProblem(res, {
      title: 'Validation failed',
      status: 400,
      detail: 'Request body is not valid JSON.',
      errors: { body: ['body must be valid JSON'] },
    });
    return;
  }

  // 3) Altri errori client di Express/body-parser (413 body troppo grande, 415 charset non supportato...).
  const status = frameworkError.status ?? frameworkError.statusCode;
  if (status && status >= 400 && status < 500 && frameworkError.expose) {
    sendProblem(res, {
      title: STATUS_CODES[status] ?? 'Bad Request',
      status,
      detail: frameworkError.message,
    });
    return;
  }

  // 4) Errore inatteso: tutto nei log (con stack trace), al client solo un messaggio generico.
  req.log.error({ err }, 'Unhandled error');
  sendProblem(res, {
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred.',
  });
}
