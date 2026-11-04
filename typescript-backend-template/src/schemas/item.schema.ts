/**
 * Schemi TypeBox (= JSON Schema) della risorsa Item: DTO di input/output e schema di ogni rotta.
 *
 * Perche' TypeBox: uno schema TypeBox E' un JSON Schema. Fastify lo usa cosi' com'e' per
 * 1) validare le richieste con Ajv, 2) serializzare velocemente le risposte,
 * 3) generare la documentazione OpenAPI; e `Static<typeof Schema>` ne ricava il tipo
 * TypeScript. Una sola definizione, nessuna duplicazione tra tipi e validazione.
 */
import { Type, type Static } from 'typebox';
import { ProblemDetailsSchema } from './problem.schema.ts';

export const ITEM_NAME_MAX_LENGTH = 100;
export const ITEM_DESCRIPTION_MAX_LENGTH = 500;

/** DTO di output: cio' che il client riceve. */
export const ItemSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    description: Type.Union([Type.String(), Type.Null()]),
    price: Type.Number(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
  },
  { title: 'Item' },
);

/** DTO di input per POST e PUT. Le proprieta' sconosciute vengono rimosse da Ajv. */
export const ItemInputSchema = Type.Object(
  {
    name: Type.String({ minLength: 1, maxLength: ITEM_NAME_MAX_LENGTH, examples: ['Keyboard'] }),
    description: Type.Optional(
      Type.Union([Type.String({ maxLength: ITEM_DESCRIPTION_MAX_LENGTH }), Type.Null()]),
    ),
    price: Type.Number({ minimum: 0, examples: [49.9] }),
  },
  { title: 'ItemInput' },
);

/** Parametro di percorso {id}. Nessun vincolo di formato: un id sconosciuto deve dare 404. */
export const ItemParamsSchema = Type.Object({
  id: Type.String({ description: 'Item id (UUID v4)' }),
});

export type ItemDto = Static<typeof ItemSchema>;
export type ItemInput = Static<typeof ItemInputSchema>;

// ---------------------------------------------------------------------------
// Schemi completi delle rotte (input + risposte), usati da routes e controller.
// ---------------------------------------------------------------------------

const tags = ['items'];

export const listItemsSchema = {
  tags,
  summary: 'List all items (sorted by createdAt)',
  response: { 200: Type.Array(ItemSchema) },
};

export const getItemSchema = {
  tags,
  summary: 'Get an item by id',
  params: ItemParamsSchema,
  response: { 200: ItemSchema, 404: ProblemDetailsSchema },
};

export const createItemSchema = {
  tags,
  summary: 'Create an item',
  body: ItemInputSchema,
  response: { 201: ItemSchema, 400: ProblemDetailsSchema },
};

export const updateItemSchema = {
  tags,
  summary: 'Replace an item',
  params: ItemParamsSchema,
  body: ItemInputSchema,
  response: { 200: ItemSchema, 400: ProblemDetailsSchema, 404: ProblemDetailsSchema },
};

export const deleteItemSchema = {
  tags,
  summary: 'Delete an item',
  params: ItemParamsSchema,
  response: {
    204: Type.Null({ description: 'Item deleted, empty body' }),
    404: ProblemDetailsSchema,
  },
};
