// Campo di testo con label, hint ed errore. Accetta tutti gli attributi di <input>,
// compreso `ref`: in React 19 il ref e' una prop normale, quindi funziona con
// react-hook-form (`{...register('name')}`) senza forwardRef.
import { useId, type InputHTMLAttributes, type Ref } from 'react';

import { describedBy } from './describedBy';
import { FormField } from './FormField';
import styles from './FormField.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ label, hint, error, id, required, className, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FormField id={inputId} label={label} hint={hint} error={error} required={required}>
      <input
        id={inputId}
        className={[styles.control, className].filter(Boolean).join(' ')}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        {...rest}
      />
    </FormField>
  );
}
