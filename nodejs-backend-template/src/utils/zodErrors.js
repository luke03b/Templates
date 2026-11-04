// Converte gli errori di zod nel formato "campo -> lista di messaggi" richiesto dal contratto API.

/**
 * @param {import('zod').ZodError} error
 * @param {string} [rootKey] Chiave usata per gli errori che non riguardano un campo (es. body non oggetto).
 * @returns {Record<string, string[]>}
 */
export function zodErrorToFieldErrors(error, rootKey = 'body') {
  /** @type {Record<string, string[]>} */
  const fieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : rootKey;
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}
