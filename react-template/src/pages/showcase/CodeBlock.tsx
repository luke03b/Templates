// Blocco di codice con bottone "Copy" (usa la Clipboard API del browser).
import { useState } from 'react';

import { Button } from '@/components/ui';

import styles from './Showcase.module.css';

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard non disponibile (es. pagina non in HTTPS): l'utente puo' selezionare a mano.
      setCopied(false);
    }
  };

  return (
    <div className={styles.code}>
      <Button size="sm" variant="ghost" className={styles.copy} onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </Button>
      <pre>
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}
