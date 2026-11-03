/** Controller dell'health check. */
import type { HealthService } from '../services/health.service.ts';
import type { getHealthSchema } from '../schemas/health.schema.ts';
import type { FastifyReplyTypeBox, FastifyRequestTypeBox } from '../utils/typebox.ts';

export class HealthController {
  readonly #service: HealthService;

  constructor(service: HealthService) {
    this.#service = service;
  }

  get = async (
    _request: FastifyRequestTypeBox<typeof getHealthSchema>,
    reply: FastifyReplyTypeBox<typeof getHealthSchema>,
  ) => reply.send(this.#service.getHealth());
}
