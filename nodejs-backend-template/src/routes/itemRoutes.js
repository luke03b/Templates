// Rotte di /api/items: per ogni rotta, prima la validazione (middleware) poi il controller.
import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { itemIdParamsSchema, itemInputSchema } from '../schemas/itemSchemas.js';

/**
 * @param {ReturnType<typeof import('../controllers/itemController.js').createItemController>} itemController
 */
export function createItemRouter(itemController) {
  const router = Router();
  const validateId = validate(itemIdParamsSchema, 'params');

  router.get('/', itemController.list);
  router.post('/', validate(itemInputSchema), itemController.create);
  router.get('/:id', validateId, itemController.getById);
  router.put('/:id', validateId, validate(itemInputSchema), itemController.update);
  router.delete('/:id', validateId, itemController.remove);

  return router;
}
