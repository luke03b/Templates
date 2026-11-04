// Traduce gli errori di validazione di Angular (e quelli arrivati dal server) in testo leggibile.
import { ValidationErrors } from '@angular/forms';

/** Restituisce il primo messaggio rilevante, o stringa vuota se non ci sono errori. */
export function getErrorMessage(errors: ValidationErrors | null | undefined): string {
  if (!errors) {
    return '';
  }

  // Errori arrivati dal backend (Problem Details) hanno la precedenza: vedi applyServerErrors.
  const server = errors['server'] as string[] | undefined;
  if (server?.length) {
    return server.join(' ');
  }

  if (errors['required']) {
    return 'This field is required.';
  }
  if (errors['email']) {
    return 'Enter a valid email address.';
  }
  if (errors['minlength']) {
    return `Enter at least ${errors['minlength'].requiredLength} characters.`;
  }
  if (errors['maxlength']) {
    return `Enter at most ${errors['maxlength'].requiredLength} characters.`;
  }
  if (errors['min']) {
    return `Must be greater than or equal to ${errors['min'].min}.`;
  }
  if (errors['max']) {
    return `Must be less than or equal to ${errors['max'].max}.`;
  }
  if (errors['pattern']) {
    return 'The format is not valid.';
  }
  return 'The value is not valid.';
}
