/**
 * Controller (layer HTTP) della risorsa Item.
 *
 * Responsabilita': leggere parametri/body gia' validati, chiamare il service, scegliere
 * status code e header, mappare il risultato nel DTO. Nessuna logica di business.
 * Gli errori lanciati dal service NON vengono catturati qui: Fastify li passa
 * automaticamente all'error handler globale.
 *
 * Gli handler sono "arrow function" assegnate a campi della classe: in questo modo
 * `this` resta legato all'istanza anche quando li passiamo a Fastify come callback.
 */
import type { ItemService } from '../services/item.service.ts';
import type {
  createItemSchema,
  deleteItemSchema,
  getItemSchema,
  listItemsSchema,
  updateItemSchema,
} from '../schemas/item.schema.ts';
import type { FastifyReplyTypeBox, FastifyRequestTypeBox } from '../utils/typebox.ts';
import { toItemDto } from './item.mapper.ts';

type Req<T extends object> = FastifyRequestTypeBox<T>;
type Rep<T extends object> = FastifyReplyTypeBox<T>;

export class ItemController {
  readonly #service: ItemService;

  constructor(service: ItemService) {
    this.#service = service;
  }

  list = async (_request: Req<typeof listItemsSchema>, reply: Rep<typeof listItemsSchema>) => {
    const items = await this.#service.list();
    return reply.send(items.map(toItemDto));
  };

  getById = async (request: Req<typeof getItemSchema>, reply: Rep<typeof getItemSchema>) => {
    const item = await this.#service.getById(request.params.id);
    return reply.send(toItemDto(item));
  };

  create = async (request: Req<typeof createItemSchema>, reply: Rep<typeof createItemSchema>) => {
    const item = await this.#service.create(request.body);
    // routeOptions.url e' il percorso registrato della rotta con il prefisso ("/api/items").
    const location = `${request.routeOptions.url ?? '/api/items'}/${item.id}`;
    return reply.code(201).header('location', location).send(toItemDto(item));
  };

  update = async (request: Req<typeof updateItemSchema>, reply: Rep<typeof updateItemSchema>) => {
    const item = await this.#service.update(request.params.id, request.body);
    return reply.send(toItemDto(item));
  };

  delete = async (request: Req<typeof deleteItemSchema>, reply: Rep<typeof deleteItemSchema>) => {
    await this.#service.delete(request.params.id);
    return reply.code(204).send(null);
  };
}
