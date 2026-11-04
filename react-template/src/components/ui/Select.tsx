// Menu a tendina nativo (<select>): accessibile e usabile da tastiera senza codice extra.
import { useId, type Ref, type SelectHTMLAttributes } from 'react';

import { describedBy } from './describedBy';
import { FormField } from './FormField';
import styles from './FormField.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  /** Prima opzione vuota, es. "Choose...". */
  placeholder?: string;
  hint?: string | undefined;
  error?: string | undefined;
  ref?: Ref<HTMLSelectElement>;
}

export function Select({
  label,
  options,
  placeholder,
  hint,
  error,
  id,
  required,
  className,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FormField id={selectId} label={label} hint={hint} error={error} required={required}>
      <select
        id={selectId}
        className={[styles.control, className].filter(Boolean).join(' ')}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(selectId, hint, error)}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
