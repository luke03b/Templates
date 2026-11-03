// Servizio API per lo stato del backend (GET /api/health).

import { http } from '@/api/httpClient';

/** Risposta di GET /api/health secondo il contratto. */
export interface HealthResponse {
  status: 'ok';
  service: string;
  timestamp: string;
}

export const healthApi = {
  get: (signal?: AbortSignal) => http.get<HealthResponse>('/health', signal),
};
