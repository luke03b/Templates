// Controller della risorsa "items": traduce HTTP <-> service.
// Riceve dati gia' validati dal middleware "validate", chiama il service e sceglie
// codice di stato e header. Nessuna logica di business qui.
// Gli handler sono async: con Express 5 un errore lanciato (o una Promise rifiutata)
// arriva da solo all'errorHandler, senza try/catch.

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** Richiesta con parametro di percorso ":id". @typedef {import('express').Request<{ id: string }>} RequestWithId */

/**
 * La funzione "factory" riceve il service e restituisce gli handler: il service resta
 * accessibile tramite closure (la funzione interna "ricorda" le variabili di quella esterna).
 * @param {import('../services/itemService.js').ItemService} itemService
 */
export function createItemController(itemService) {
  return {
    /**
     * GET /api/items
     * @param {Request} _req
     * @param {Response} res
     */
    async list(_req, res) {
      res.status(200).json(await itemService.list());
    },

    /**
     * GET /api/items/:id
     * @param {RequestWithId} req
     * @param {Response} res
     */
    async getById(req, res) {
      res.status(200).json(await itemService.getById(req.params.id));
    },

    /**
     * POST /api/items
     * @param {Request} req
     * @param {Response} res
     */
    async create(req, res) {
      const item = await itemService.create(req.body);
      res.status(201).location(`${req.baseUrl}/${item.id}`).json(item);
    },

    /**
     * PUT /api/items/:id
     * @param {RequestWithId} req
     * @param {Response} res
     */
    async update(req, res) {
      res.status(200).json(await itemService.update(req.params.id, req.body));
    },

    /**
     * DELETE /api/items/:id
     * @param {RequestWithId} req
     * @param {Response} res
     */
    async remove(req, res) {
      await itemService.remove(req.params.id);
      res.status(204).end();
    },
  };
}
