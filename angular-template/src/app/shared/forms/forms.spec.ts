// Test degli helper dei form: validator, messaggi di errore e mappatura errori del server.
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { AppValidators } from './app-validators';
import { getErrorMessage } from './error-messages';
import { applyServerErrors } from './server-errors';

describe('form helpers', () => {
  it('notBlank rejects whitespace-only strings', () => {
    expect(AppValidators.notBlank(new FormControl('   '))).toEqual({ required: true });
    expect(AppValidators.notBlank(new FormControl('ok'))).toBeNull();
  });

  it('getErrorMessage returns readable messages', () => {
    expect(getErrorMessage(null)).toBe('');
    expect(getErrorMessage({ required: true })).toBe('This field is required.');
    expect(getErrorMessage({ maxlength: { requiredLength: 100, actualLength: 101 } })).toBe(
      'Enter at most 100 characters.',
    );
    expect(getErrorMessage({ min: { min: 0, actual: -1 } })).toBe(
      'Must be greater than or equal to 0.',
    );
    expect(getErrorMessage({ server: ['name is required'], required: true })).toBe(
      'name is required',
    );
  });

  it('applyServerErrors maps errors to controls and returns unmatched ones', () => {
    const form = new FormGroup({
      name: new FormControl('x', Validators.required),
      price: new FormControl(1),
    });

    const unmatched = applyServerErrors(form, {
      name: ['name is too long'],
      other: ['unknown field'],
    });

    expect(form.controls.name.errors).toEqual({ server: ['name is too long'] });
    expect(form.controls.name.touched).toBe(true);
    expect(unmatched).toEqual(['unknown field']);

    // L'errore del server sparisce appena l'utente modifica il valore.
    form.controls.name.setValue('y');
    expect(form.controls.name.errors).toBeNull();
  });
});
