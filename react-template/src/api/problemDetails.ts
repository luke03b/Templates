// Tipi e helper per gli errori in formato Problem Details (RFC 9457) restituiti dal backend.

/** Corpo di un errore come definito nel contratto API (docs/api-contract.md). */
export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  /** Solo per i 400 di validazione: nome campo -> lista di messaggi. */
  errors?: Record<string, string[]>;
}

/** Type guard: verifica a runtime che un valore sconosciuto abbia la forma di un ProblemDetails. */
export function isProblemDetails(value: unknown): value is ProblemDetails {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.title === 'string' && typeof candidate.status === 'number';
}
