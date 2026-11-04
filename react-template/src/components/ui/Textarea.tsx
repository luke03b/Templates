// Area di testo multi-riga con label, hint ed errore (stessa API di Input).
import { useId, type Ref, type TextareaHTMLAttributes } from 'react';

import { describedBy } from './describedBy';
import { FormField } from './FormField';
import styles from './FormField.module.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ label, hint, error, id, required, className, ...rest }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <FormField id={textareaId} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={textareaId}
        className={[styles.control, styles.textarea, className].filter(Boolean).join(' ')}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(textareaId, hint, error)}
        {...rest}
      />
    </FormField>
  );
}
