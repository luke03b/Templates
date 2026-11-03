// Indicatore di caricamento circolare. Ha role="status" cosi' gli screen reader annunciano il testo.
import styles from './Spinner.module.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  /** Testo letto dagli screen reader (non visibile). */
  label?: string;
}

export function Spinner({ size = 'md', label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" className={`${styles.spinner} ${styles[size]}`}>
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
