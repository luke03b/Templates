/**
 * Configurazione del validatore Ajv (JSON Schema) usato da Fastify.
 *
 * Usiamo due istanze di Ajv:
 * - body: NESSUNA coercizione dei tipi. "price": "10" (stringa) deve essere un errore 400,
 *   non diventare silenziosamente 10.
 * - params/querystring/headers: coercizione attiva, perche' nell'URL tutto e' una stringa
 *   (es. ?limit=10 deve diventare il numero 10 se lo schema dice Integer).
 * In entrambe: `allErrors` per restituire tutti gli errori insieme, e `removeAdditional`
 * per scartare i campi non previsti dallo schema (protezione da "mass assignment").
 */
import { Ajv, type Options } from 'ajv';
import addFormatsImport from 'ajv-formats';
import type { FastifyInstance } from 'fastify';

// ajv-formats e' pubblicato in CommonJS: in ESM il default export arriva "annidato".
const addFormats = addFormatsImport as unknown as typeof addFormatsImport.default;

const baseOptions: Options = {
  allErrors: true,
  removeAdditional: true,
  useDefaults: true,
  // Le parole chiave extra usate per la documentazione OpenAPI non sono errori.
  strict: false,
};

export function configureValidation(app: FastifyInstance): void {
  const bodyAjv = addFormats(new Ajv({ ...baseOptions, coerceTypes: false }));
  const otherAjv = addFormats(new Ajv({ ...baseOptions, coerceTypes: 'array' }));

  app.setValidatorCompiler(({ schema, httpPart }) =>
    (httpPart === 'body' ? bodyAjv : otherAjv).compile(schema),
  );
}
