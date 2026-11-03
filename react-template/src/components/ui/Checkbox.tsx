// Checkbox nativa con etichetta cliccabile. `ref` compatibile con react-hook-form.
import { useId, type InputHTMLAttributes, type Ref } from 'react';

import styles from './Checkbox.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string | undefined;
  ref?: Ref<HTMLInputElement>;
}

export function Checkbox({ label, error, id, ...rest }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={styles.wrapper}>
      <label htmlFor={inputId} className={styles.option}>
        <input
          id={inputId}
          type="checkbox"
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
