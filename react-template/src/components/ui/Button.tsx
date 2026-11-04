// Bottone riutilizzabile con varianti, dimensioni e stato di caricamento.
// Estende gli attributi nativi di <button> (onClick, type, aria-*...), quindi si usa come un button normale.
import type { ButtonHTMLAttributes } from 'react';

import styles from './Button.module.css';
import { Spinner } from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  /** Mostra uno spinner e disabilita il bottone finche' un'operazione e' in corso. */
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  type = 'button', // default sicuro: evita submit involontari dentro i form
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size="sm" label="Loading" />}
      {children}
    </button>
  );
}
