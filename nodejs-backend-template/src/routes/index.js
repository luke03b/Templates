// Router principale montato su /api: riunisce i router delle singole risorse.
// Per aggiungere una risorsa: crea il suo router e aggiungi una riga "router.use(...)".
import { Router } from 'express';
import { createHealthRouter } from './healthRoutes.js';
import { createItemRouter } from './itemRoutes.js';

/**
 * @param {object} controllers
 * @param {ReturnType<typeof import('../controllers/healthController.js').createHealthController>} controllers.healthController
 * @param {ReturnType<typeof import('../controllers/itemController.js').createItemController>} controllers.itemController
 */
export function createApiRouter({ healthController, itemController }) {
  const router = Router();
  router.use('/health', createHealthRouter(healthController));
  router.use('/items', createItemRouter(itemController));
  return router;
}
