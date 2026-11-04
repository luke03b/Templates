/**
 * Errori applicativi "attesi".
 *
 * I service lanciano queste classi quando un caso d'uso non puo' essere completato
 * (es. risorsa inesistente). L'error handler globale (src/plugins/error-handler.ts)
 * le traduce in risposte Problem Details con il codice HTTP corretto.
 * Tutto cio' che NON e' un AppError viene considerato un bug e diventa un 500 generico.
 */

/** Mappa campo -> lista di messaggi, come richiesto dal contratto per gli errori 400. */
export type FieldErrors = Record<string, string[]>;

export class AppError extends Error {
  override readonly name: string = 'AppError';
  readonly statusCode: number;
  readonly title: string;

  constructor(statusCode: number, title: string, detail: string) {
    super(detail);
    this.statusCode = statusCode;
    this.title = title;
  }
}

export class NotFoundError extends AppError {
  override readonly name = 'NotFoundError';

  constructor(resource: string, id: string) {
    super(404, 'Not Found', `${resource} with id '${id}' was not found.`);
  }
}

export class ValidationError extends AppError {
  override readonly name = 'ValidationError';
  readonly errors: FieldErrors;

  constructor(errors: FieldErrors, detail = 'One or more fields are invalid.') {
    super(400, 'Validation failed', detail);
    this.errors = errors;
  }
}
