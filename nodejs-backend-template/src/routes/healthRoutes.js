// Rotte di /api/health.
import { Router } from 'express';

/**
 * @param {ReturnType<typeof import('../controllers/healthController.js').createHealthController>} healthController
 */
export function createHealthRouter(healthController) {
  const router = Router();
  router.get('/', healthController.getHealth);
  return router;
}
