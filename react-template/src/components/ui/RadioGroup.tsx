// Gruppo di radio button (scelta singola). <fieldset>+<legend> danno il nome al gruppo
// e le frecce della tastiera spostano la selezione nativamente.
import { useId, type ChangeEvent } from 'react';

import styles from './Checkbox.module.css';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
  orientation?: 'horizontal' | 'vertical';
  error?: string;
}

export function RadioGroup({
  label,
  options,
  value,
  onChange,
  name,
  orientation = 'vertical',
  error,
}: RadioGroupProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  const errorId = `${groupName}-error`;
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);

  return (
    <fieldset className={styles.fieldset} aria-describedby={error ? errorId : undefined}>
      <legend className={styles.legend}>{label}</legend>
      <div
        className={`${styles.fieldset} ${orientation === 'horizontal' ? styles.horizontal : ''}`}
      >
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              className={styles.input}
              name={groupName}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={handleChange}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
