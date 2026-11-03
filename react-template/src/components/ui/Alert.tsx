// Messaggio in linea (info, successo, avviso, errore).
// Gli errori usano role="alert" (annunciati subito), gli altri role="status" (annuncio educato).
import type { ReactNode } from 'react';

import styles from './Alert.module.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  /** Se presente mostra un bottone di chiusura. */
  onDismiss?: () => void;
}

export function Alert({ variant = 'info', title, children, onDismiss }: AlertProps) {
  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      className={`${styles.alert} ${styles[variant]}`}
    >
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div>{children}</div>}
      </div>
      {onDismiss && (
        <button type="button" className={styles.close} onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
