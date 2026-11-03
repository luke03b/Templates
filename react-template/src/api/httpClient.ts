// Client HTTP unico dell'applicazione: TUTTE le chiamate al backend passano da qui.
// Si occupa di URL base, header JSON, parsing della risposta e conversione degli errori
// (Problem Details) in un'eccezione tipizzata `ApiError` che la UI sa mostrare.

import { env } from '@/config/env';

import { isProblemDetails, type ProblemDetails } from './problemDetails';

/** Errore lanciato per qualunque risposta non 2xx o problema di rete. */
export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails | undefined;

  constructor(message: string, status: number, problem?: ProblemDetails) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }

  /** Errori di validazione per campo (vuoto se non e' un 400 di validazione). */
  get fieldErrors(): Record<string, string[]> {
    return this.problem?.errors ?? {};
  }
}

/** Status convenzionale per "il server non ha risposto" (rete giu', proxy senza backend...). */
export const NETWORK_ERROR_STATUS = 0;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Esegue una richiesta verso `${apiBaseUrl}${path}` e restituisce il JSON tipizzato.
 * Il generico <T> e' il tipo atteso della risposta: TypeScript non lo verifica a runtime,
 * e' una "promessa" che facciamo al compilatore in base al contratto API.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    // Una richiesta annullata (es. componente smontato) deve propagarsi cosi' com'e'.
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('Unable to reach the server.', NETWORK_ERROR_STATUS);
  }

  // 204 No Content (es. DELETE): nessun corpo da leggere.
  if (response.status === 204) return undefined as T;

  const payload = await parseBody(response);

  if (!response.ok) {
    if (isProblemDetails(payload)) {
      throw new ApiError(payload.detail ?? payload.title, response.status, payload);
    }
    throw new ApiError(`Request failed with status ${response.status}.`, response.status);
  }

  return payload as T;
}

/** Legge il corpo come JSON se il Content-Type lo indica (anche application/problem+json). */
async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('Content-Type') ?? '';
  if (!contentType.includes('json')) return undefined;
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

/** Scorciatoie leggibili per i verbi HTTP. */
export const http = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};

/** Converte qualunque errore in un messaggio leggibile per l'utente. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Unexpected error.';
}
