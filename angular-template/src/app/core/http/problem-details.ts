// Tipi e funzioni pure per convertire gli errori HTTP (formato Problem Details, RFC 9457)
// in un unico tipo `ApiError` usato da tutta l'app.
import { HttpErrorResponse } from '@angular/common/http';

/** Corpo `application/problem+json` restituito dal backend in caso di errore. */
export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  /** Solo per i 400 di validazione: campo -> lista di messaggi. */
  errors?: Record<string, string[]>;
}

/** Errore normalizzato: le pagine e gli store gestiscono solo questo tipo. */
export class ApiError extends Error {
  constructor(
    /** Codice HTTP; 0 significa "nessuna risposta" (rete giu', backend spento, CORS). */
    readonly status: number,
    readonly title: string,
    readonly detail?: string,
    /** Errori di validazione per campo (vuoto se non e' un 400 di validazione). */
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(detail ?? title);
    this.name = 'ApiError';
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 400 && Object.keys(this.fieldErrors).length > 0;
  }
}

/** Type guard: verifica a runtime che un valore abbia la forma di un Problem Details. */
export function isProblemDetails(value: unknown): value is ProblemDetails {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<ProblemDetails>;
  return typeof candidate.title === 'string' && typeof candidate.status === 'number';
}

/** Converte qualsiasi errore (HttpErrorResponse, Error, valore sconosciuto) in ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return new ApiError(
        0,
        'Network error',
        'Unable to reach the server. Please try again later.',
      );
    }

    if (isProblemDetails(error.error)) {
      const problem = error.error;
      return new ApiError(problem.status, problem.title, problem.detail, problem.errors ?? {});
    }

    return new ApiError(error.status, error.statusText || 'Request failed', error.message);
  }

  const message = error instanceof Error ? error.message : 'Unexpected error';
  return new ApiError(-1, 'Unexpected error', message);
}
