/**
 * Rotte della risorsa Item (montate sotto /api/items).
 * Qui si collegano: metodo + percorso + schema (validazione e OpenAPI) + handler del controller.
 */
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { ItemController } from '../controllers/item.controller.ts';
import {
  createItemSchema,
  deleteItemSchema,
  getItemSchema,
  listItemsSchema,
  updateItemSchema,
} from '../schemas/item.schema.ts';
import { trimBodyFields } from '../utils/trim-body-fields.ts';

export interface ItemRoutesOptions {
  controller: ItemController;
}

// Percorso '' = esattamente il prefisso (/api/items), senza slash finale.
const trimItemInput = trimBodyFields(['name', 'description']);

export const itemRoutes: FastifyPluginAsyncTypebox<ItemRoutesOptions> = async (
  app,
  { controller },
) => {
  app.get('', { schema: listItemsSchema }, controller.list);
  app.get('/:id', { schema: getItemSchema }, controller.getById);
  app.post('', { schema: createItemSchema, preValidation: trimItemInput }, controller.create);
  app.put('/:id', { schema: updateItemSchema, preValidation: trimItemInput }, controller.update);
  app.delete('/:id', { schema: deleteItemSchema }, controller.delete);
};
