// Interruttore on/off. E' una checkbox nativa con role="switch": la tastiera (Spazio)
// funziona gratis e gli screen reader la annunciano come "interruttore, attivo/disattivo".
import { useId, type InputHTMLAttributes, type Ref } from 'react';

import styles from './Switch.module.css';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> {
  label: string;
  ref?: Ref<HTMLInputElement>;
}

export function Switch({ label, id, ...rest }: SwitchProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label htmlFor={inputId} className={styles.switch}>
      <input id={inputId} type="checkbox" role="switch" className={styles.input} {...rest} />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      <span>{label}</span>
    </label>
  );
}
