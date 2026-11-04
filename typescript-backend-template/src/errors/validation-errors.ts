/**
 * Traduzione degli errori di validazione di Ajv (il validatore JSON Schema usato da Fastify)
 * nel formato del contratto: { campo: ["messaggio leggibile", ...] }.
 */
import type { FastifySchemaValidationError } from 'fastify/types/schema.js';
import type { FieldErrors } from './app-error.ts';

export function toFieldErrors(
  validation: readonly FastifySchemaValidationError[],
  context = 'body',
): FieldErrors {
  const result: FieldErrors = {};
  const add = (field: string, message: string): void => {
    const messages = (result[field] ??= []);
    if (!messages.includes(message)) messages.push(message);
  };

  // Gli errori dei rami di un anyOf (es. "string | null") vengono raggruppati per campo
  // e riassunti in un solo messaggio, invece di elencare ogni ramo fallito.
  const unionBranches = new Map<string, FastifySchemaValidationError[]>();

  for (const error of validation) {
    const field = fieldName(error, context);
    if (error.schemaPath.includes('/anyOf/')) {
      unionBranches.set(field, [...(unionBranches.get(field) ?? []), error]);
      continue;
    }
    if (error.keyword === 'anyOf') continue;
    add(field, describe(field, error));
  }

  for (const [field, branchErrors] of unionBranches) {
    // Se il tipo era giusto ma un vincolo no (es. maxLength), mostriamo quel vincolo.
    const constraintErrors = branchErrors.filter((error) => error.keyword !== 'type');
    if (constraintErrors.length > 0) {
      for (const error of constraintErrors) add(field, describe(field, error));
    } else {
      const types = branchErrors.map((error) => String(error.params.type));
      add(field, `${field} must be of type ${types.join(' or ')}`);
    }
  }

  return result;
}

/** "/price" -> "price", "/tags/0" -> "tags.0", errore "required" -> nome della proprieta' mancante. */
function fieldName(error: FastifySchemaValidationError, context: string): string {
  const segments = error.instancePath.split('/').filter(Boolean);
  const missing = error.params.missingProperty;
  if (error.keyword === 'required' && typeof missing === 'string') segments.push(missing);
  return segments.length > 0 ? segments.join('.') : context;
}

function describe(field: string, error: FastifySchemaValidationError): string {
  const params = error.params;
  switch (error.keyword) {
    case 'required':
      return `${field} is required`;
    case 'type':
      return `${field} must be of type ${String(params.type)}`;
    case 'minLength':
      return params.limit === 1
        ? `${field} must not be empty`
        : `${field} must be at least ${String(params.limit)} characters long`;
    case 'maxLength':
      return `${field} must be at most ${String(params.limit)} characters long`;
    case 'minimum':
      return `${field} must be greater than or equal to ${String(params.limit)}`;
    case 'exclusiveMinimum':
      return `${field} must be greater than ${String(params.limit)}`;
    case 'maximum':
      return `${field} must be less than or equal to ${String(params.limit)}`;
    case 'exclusiveMaximum':
      return `${field} must be less than ${String(params.limit)}`;
    case 'format':
      return `${field} must be a valid ${String(params.format)}`;
    case 'enum':
      return `${field} must be one of: ${(params.allowedValues as unknown[]).join(', ')}`;
    default:
      return `${field} ${error.message ?? 'is invalid'}`;
  }
}
