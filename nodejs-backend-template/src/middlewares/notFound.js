// Middleware "catch-all": viene montato dopo tutte le rotte, quindi risponde solo se
// nessuna rotta ha gestito la richiesta. Restituisce un 404 in formato Problem Details.
import { NotFoundError } from '../utils/httpErrors.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export function notFound(req, _res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found.`));
}
