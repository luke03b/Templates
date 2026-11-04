// Etichetta compatta per stati o categorie (es. "New", "Online").
import type { ReactNode } from 'react';

import styles from './Badge.module.css';

export interface BadgeProps {
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
  children: ReactNode;
}

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}
