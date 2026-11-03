// Helper per inviare risposte di errore nel formato Problem Details (RFC 9457),
// con Content-Type "application/problem+json" come richiesto dal contratto API.

/**
 * @typedef {object} ProblemDetails
 * @property {string} [type] URI che identifica il tipo di problema ("about:blank" = generico).
 * @property {string} title
 * @property {number} status
 * @property {string} detail
 * @property {Record<string, string[]>} [errors] Solo per gli errori di validazione (400).
 */

/**
 * Invia una risposta Problem Details.
 * @param {import('express').Response} res
 * @param {ProblemDetails} problem
 */
export function sendProblem(res, { type = 'about:blank', title, status, detail, errors }) {
  /** @type {ProblemDetails} */
  const body = { type, title, status, detail };
  if (errors) body.errors = errors;
  res.status(status).type('application/problem+json').json(body);
}
