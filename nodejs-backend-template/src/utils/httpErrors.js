// Errori applicativi "attesi" (404, 400, ...). I service li lanciano con `throw`,
// il middleware errorHandler li trasforma in risposte Problem Details (RFC 9457).
// Tutto cio' che NON e' un HttpError viene considerato inatteso e diventa un 500 generico.

/** Errore HTTP con stato e testo sicuri da mostrare al client. */
export class HttpError extends Error {
  /**
   * @param {number} status Codice HTTP (4xx).
   * @param {string} title Breve riassunto del tipo di problema (es. "Not Found").
   * @param {string} detail Spiegazione specifica di questo caso.
   * @param {Record<string, string[]>} [errors] Errori per campo (solo per la validazione).
   */
  constructor(status, title, detail, errors) {
    super(detail);
    this.name = new.target.name;
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.errors = errors;
  }
}

/** 404: la risorsa richiesta non esiste. */
export class NotFoundError extends HttpError {
  /** @param {string} detail */
  constructor(detail) {
    super(404, 'Not Found', detail);
  }
}

/** 400: uno o piu' campi non sono validi. */
export class ValidationError extends HttpError {
  /** @param {Record<string, string[]>} errors Mappa campo -> lista di messaggi. */
  constructor(errors, detail = 'One or more fields are invalid.') {
    super(400, 'Validation failed', detail, errors);
  }
}
