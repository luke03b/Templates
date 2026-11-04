// Mappa gli errori di validazione del backend (Problem Details `errors`) sui controlli del form.
import { AbstractControl } from '@angular/forms';

/**
 * Imposta l'errore `server` sui controlli con lo stesso nome del campo restituito dal backend
 * e li marca come "touched" cosi' <mat-error> li mostra subito.
 * L'errore sparisce da solo appena l'utente modifica il campo (Angular rivalida il controllo).
 *
 * @returns i messaggi dei campi che non corrispondono a nessun controllo (da mostrare in un alert).
 */
export function applyServerErrors(
  form: AbstractControl,
  errors: Record<string, string[]>,
): string[] {
  const unmatched: string[] = [];

  for (const [field, messages] of Object.entries(errors)) {
    const control = form.get(field);
    if (control) {
      control.setErrors({ ...control.errors, server: messages });
      control.markAsTouched();
    } else {
      unmatched.push(...messages);
    }
  }

  return unmatched;
}
