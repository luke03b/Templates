// Middleware di validazione riutilizzabile: valida una parte della richiesta con uno schema zod.
// Uso:  router.post('/items', validate(itemInputSchema), controller.create)
//       router.get('/items/:id', validate(itemIdParamsSchema, 'params'), controller.getById)
// Se i dati sono validi li sostituisce con la versione "pulita" (trim, default, campi extra rimossi);
// altrimenti passa un ValidationError al gestore centrale degli errori (-> 400 Problem Details).
import { ValidationError } from '../utils/httpErrors.js';
import { zodErrorToFieldErrors } from '../utils/zodErrors.js';

/**
 * @param {import('zod').ZodType} schema
 * @param {'body' | 'params' | 'query'} [source] Parte della richiesta da validare.
 * @returns {import('express').RequestHandler}
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    // Senza Content-Type JSON o senza corpo, in Express 5 req.body e' undefined:
    // lo trattiamo come oggetto vuoto per restituire errori sui singoli campi.
    const input = source === 'body' ? (req.body ?? {}) : req[source];
    const result = schema.safeParse(input);

    if (!result.success) {
      next(new ValidationError(zodErrorToFieldErrors(result.error, source)));
      return;
    }

    if (source === 'query') {
      // In Express 5 req.query e' un getter in sola lettura: lo ridefiniamo con i dati validati.
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
      });
    } else {
      req[source] = result.data;
    }
    next();
  };
}
