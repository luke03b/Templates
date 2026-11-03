// Collega gli errori di validazione del backend (Problem Details 400) ai campi di react-hook-form.
// Cosi' un errore come { errors: { name: ["name is required"] } } appare sotto il campo "name".

import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { ApiError, getErrorMessage } from '@/api/httpClient';

/** Chiave dell'errore "generale" del form (non legato a un campo). */
export const ROOT_SERVER_ERROR = 'root.serverError' as const;

/**
 * Applica l'errore al form: i campi noti ricevono il proprio messaggio,
 * tutto il resto finisce nell'errore generale `root.serverError`.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldNames: readonly Path<T>[],
): void {
  const fieldErrors = error instanceof ApiError ? error.fieldErrors : {};
  let unmatched = false;

  for (const [field, messages] of Object.entries(fieldErrors)) {
    const match = fieldNames.find((name) => name === field);
    if (match) {
      setError(match, { type: 'server', message: messages.join(' ') });
    } else {
      unmatched = true;
    }
  }

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  if (!hasFieldErrors || unmatched) {
    setError(ROOT_SERVER_ERROR, { type: 'server', message: getErrorMessage(error) });
  }
}
