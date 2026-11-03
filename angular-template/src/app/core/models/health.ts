// DTO della risposta di GET /api/health.

export interface HealthStatus {
  status: string;
  service: string;
  timestamp: string;
}
