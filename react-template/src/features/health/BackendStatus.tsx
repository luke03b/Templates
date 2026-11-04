// Indicatore dello stato del backend: pallino verde "Online" o rosso "Offline".
// Usa l'hook useHealth (stato + polling); il componente si limita a disegnare il risultato.
import { Spinner } from '@/components/ui';
import { formatDateTime } from '@/lib/format';

import styles from './BackendStatus.module.css';
import { useHealth } from './useHealth';

export function BackendStatus() {
  const { data, isPending, isError } = useHealth();

  if (isPending) {
    return (
      <p className={styles.status}>
        <Spinner size="sm" label="Checking backend" />
        <span>Checking backend…</span>
      </p>
    );
  }

  const online = !isError && data.status === 'ok';

  return (
    <div className={styles.wrapper}>
      {/* aria-live: lo screen reader annuncia quando lo stato cambia. */}
      <p className={styles.status} aria-live="polite">
        <span
          className={`${styles.dot} ${online ? styles.online : styles.offline}`}
          aria-hidden="true"
        />
        <span>
          Backend: <strong>{online ? 'Online' : 'Offline'}</strong>
        </span>
      </p>
      {online && (
        <p className={styles.meta}>
          {data.service} · last check {formatDateTime(data.timestamp)}
        </p>
      )}
    </div>
  );
}
