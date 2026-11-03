/**
 * Schema TypeBox della risposta di errore Problem Details (RFC 9457).
 * Viene riusato nelle rotte per documentare in OpenAPI le risposte 4xx/5xx.
 */
import { Type } from 'typebox';

export const ProblemDetailsSchema = Type.Object(
  {
    type: Type.String({ examples: ['about:blank'] }),
    title: Type.String({ examples: ['Validation failed'] }),
    status: Type.Integer({ examples: [400] }),
    detail: Type.String({ examples: ['One or more fields are invalid.'] }),
    errors: Type.Optional(
      Type.Record(Type.String(), Type.Array(Type.String()), {
        description: 'Only for 400 responses: field name -> list of messages.',
        examples: [{ name: ['name is required'] }],
      }),
    ),
  },
  { title: 'ProblemDetails' },
);
