/**
 * Hook di rotta che fa il trim dei campi stringa indicati PRIMA della validazione.
 *
 * Serve perche' il contratto chiede "name: 1-100 caratteri (trim)": senza trim, "   "
 * passerebbe il controllo minLength. JSON Schema valida ma non trasforma i dati,
 * quindi normalizziamo il body nel momento giusto del ciclo di vita di Fastify
 * (preValidation = dopo il parsing del JSON, prima della validazione Ajv).
 */
import type { preValidationHookHandler } from 'fastify';

export function trimBodyFields(fields: readonly string[]): preValidationHookHandler {
  return (request, _reply, done) => {
    const body = request.body;
    if (body !== null && typeof body === 'object' && !Array.isArray(body)) {
      const record = body as Record<string, unknown>;
      for (const field of fields) {
        const value = record[field];
        if (typeof value === 'string') record[field] = value.trim();
      }
    }
    done();
  };
}
