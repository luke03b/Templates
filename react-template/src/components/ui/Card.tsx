// Contenitore con bordo per raggruppare contenuti. Titolo e azioni (es. bottoni) sono opzionali.
import type { HTMLAttributes, ReactNode } from 'react';

import styles from './Card.module.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
}

export function Card({ title, actions, footer, className, children, ...rest }: CardProps) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')} {...rest}>
      {(title || actions) && (
        <header className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div className={styles.body}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
}
