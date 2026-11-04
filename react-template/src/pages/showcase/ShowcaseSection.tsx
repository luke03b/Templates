// Sezione della pagina Componenti: titolo, demo dal vivo e codice copiabile.
import type { ReactNode } from 'react';

import { Card } from '@/components/ui';

import { CodeBlock } from './CodeBlock';
import styles from './Showcase.module.css';

export interface ShowcaseSectionProps {
  id: string;
  title: string;
  description?: string;
  /** Esempio di codice da copiare. */
  code: string;
  children: ReactNode;
}

export function ShowcaseSection({ id, title, description, code, children }: ShowcaseSectionProps) {
  return (
    <Card id={id} title={title} className={styles.section}>
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.demo}>{children}</div>
      <CodeBlock code={code} />
    </Card>
  );
}
