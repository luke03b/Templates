// Notifiche temporanee ("toast") in basso a destra.
// <ToastProvider> va montato una volta in cima all'app; poi ovunque si usa useToast().
// La regione ha aria-live, cosi' gli screen reader leggono i nuovi messaggi.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import styles from './Toast.module.css';
import { ToastContext, type ToastOptions, type ToastVariant } from './toastContext';

interface ToastEntry {
  id: number;
  title: string;
  description: string | undefined;
  variant: ToastVariant;
}

const DEFAULT_DURATION_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const showToast = useCallback(
    ({ title, description, variant = 'info', durationMs = DEFAULT_DURATION_MS }: ToastOptions) => {
      const id = ++nextId.current;
      setToasts((current) => [...current, { id, title, description, variant }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), durationMs),
      );
    },
    [dismiss],
  );

  // Alla chiusura dell'app (o nei test) puliamo i timer ancora attivi.
  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach((timer) => clearTimeout(timer));
  }, []);

  // useMemo evita di ricreare l'oggetto a ogni render (e di ri-renderizzare chi usa il contesto).
  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.region} role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.variant]}`} role="status">
            <div className={styles.text}>
              <p className={styles.title}>{toast.title}</p>
              {toast.description && <p className={styles.description}>{toast.description}</p>}
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
