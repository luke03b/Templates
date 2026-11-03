// Validator riutilizzabili per i Reactive Forms (in aggiunta a quelli di Angular in `Validators`).
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Un ValidatorFn riceve il controllo e restituisce `null` se il valore e' valido,
 * altrimenti un oggetto con la chiave dell'errore (letta poi da getErrorMessage).
 */
export class AppValidators {
  /** Come Validators.required ma rifiuta anche stringhe di soli spazi (il backend fa trim). */
  static notBlank: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value: unknown = control.value;
    if (typeof value === 'string' && value.trim().length === 0) {
      return { required: true };
    }
    return value === null || value === undefined ? { required: true } : null;
  };
}
