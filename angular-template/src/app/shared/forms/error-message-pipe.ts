// Pipe da template: `{{ form.controls.name.errors | errorMessage }}` dentro <mat-error>.
import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

import { getErrorMessage } from './error-messages';

/**
 * Una pipe trasforma un valore nel template. E' "pura" (default): Angular la ricalcola solo
 * quando cambia il riferimento dell'input, e l'oggetto `errors` viene ricreato a ogni validazione.
 */
@Pipe({ name: 'errorMessage' })
export class ErrorMessagePipe implements PipeTransform {
  transform(errors: ValidationErrors | null | undefined): string {
    return getErrorMessage(errors);
  }
}
