// Schema di validazione del form item, scritto con Zod.
// Le regole rispecchiano il contratto API, cosi' l'utente vede gli errori prima di inviare;
// il backend valida comunque di nuovo (e i suoi errori 400 vengono mostrati sugli stessi campi).

import { z } from 'zod';

import type { ItemInput } from './itemTypes';

export const itemFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  description: z.string().trim().max(500, 'Description must be at most 500 characters'),
  // Gli <input> restituiscono stringhe: prima controlliamo che non sia vuota, poi
  // `.pipe(z.coerce.number())` la converte in numero e applica le regole numeriche.
  price: z
    .string()
    .trim()
    .min(1, 'Price is required')
    .pipe(
      z.coerce
        .number<string>({ error: 'Price must be a number' })
        .min(0, 'Price must be greater than or equal to 0'),
    ),
});

/** Valori grezzi del form (cio' che contengono gli input, prima della validazione). */
export type ItemFormValues = z.input<typeof itemFormSchema>;
/** Valori dopo la validazione (price gia' convertito in numero). */
export type ItemFormOutput = z.output<typeof itemFormSchema>;

export const emptyItemFormValues: ItemFormValues = { name: '', description: '', price: '' };

/** Converte i valori validati del form nel DTO atteso dal backend. */
export function toItemInput(values: ItemFormOutput): ItemInput {
  return {
    name: values.name,
    description: values.description === '' ? null : values.description,
    price: values.price,
  };
}
