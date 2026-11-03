// Controller di GET /api/health: layer HTTP sottile, delega tutto al service.

/**
 * @param {import('../services/healthService.js').HealthService} healthService
 */
export function createHealthController(healthService) {
  return {
    /**
     * @param {import('express').Request} _req
     * @param {import('express').Response} res
     */
    getHealth(_req, res) {
      res.status(200).json(healthService.getHealth());
    },
  };
}
