// Schemi zod e tipi (JSDoc) della risorsa "items".
// Gli schemi descrivono la forma dei dati in INGRESSO (DTO di input) e vengono usati dal
// middleware "validate". I campi non previsti (es. "id", "createdAt") vengono scartati:
// cosi' il client non puo' sovrascrivere valori che genera il server (mass assignment).
import { z } from 'zod';

export const NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

/**
 * Restituisce il messaggio giusto per un campo mancante o di tipo sbagliato.
 * In zod 4 l'opzione "error" accetta una funzione che riceve il problema (issue) trovato.
 * @param {string} field
 * @param {string} typeMessage
 */
const requiredOrType = (field, typeMessage) => ({
  /** @param {{ input: unknown }} issue */
  error: (issue) => (issue.input === undefined ? `${field} is required` : typeMessage),
});

/** Corpo per creazione e aggiornamento: { name, description?, price }. */
export const itemInputSchema = z.object(
  {
    name: z
      .string(requiredOrType('name', 'name must be a string'))
      .trim()
      .min(1, 'name must not be empty')
      .max(NAME_MAX_LENGTH, `name must be at most ${NAME_MAX_LENGTH} characters`),
    description: z
      .string({ error: 'description must be a string or null' })
      .max(
        DESCRIPTION_MAX_LENGTH,
        `description must be at most ${DESCRIPTION_MAX_LENGTH} characters`,
      )
      .nullish()
      // Se assente (undefined) diventa null: il modello Item ha sempre il campo description.
      .transform((value) => value ?? null),
    price: z
      .number(requiredOrType('price', 'price must be a number'))
      .min(0, 'price must be greater than or equal to 0'),
  },
  { error: 'body must be a JSON object' },
);

/** Parametri di percorso per le rotte /api/items/:id. */
export const itemIdParamsSchema = z.object({
  id: z.string().min(1, 'id is required'),
});

/**
 * Dati validati in ingresso (output dello schema, dopo trim e default).
 * @typedef {z.output<typeof itemInputSchema>} ItemInput
 */

/**
 * Risorsa Item restituita dall'API.
 * @typedef {object} Item
 * @property {string} id UUID v4 generato dal server.
 * @property {string} name
 * @property {string | null} description
 * @property {number} price
 * @property {string} createdAt Data ISO 8601 UTC.
 * @property {string} updatedAt Data ISO 8601 UTC, aggiornata a ogni PUT.
 */
