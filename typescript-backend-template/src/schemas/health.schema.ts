/** Schemi della rotta GET /api/health. */
import { Type, type Static } from 'typebox';

export const HealthResponseSchema = Type.Object({
  status: Type.Literal('ok'),
  service: Type.String({ examples: ['typescript-backend-template'] }),
  timestamp: Type.String({ format: 'date-time' }),
});

export type HealthResponse = Static<typeof HealthResponseSchema>;

export const getHealthSchema = {
  tags: ['health'],
  summary: 'Service health check',
  response: { 200: HealthResponseSchema },
};
