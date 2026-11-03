// Finestra modale basata sull'elemento nativo <dialog> + showModal():
// il browser gestisce gia' focus trap, tasto Esc, sfondo (::backdrop) e inerzia della pagina.
// Il componente e' "controllato": il genitore decide se e' aperto con la prop `open`.
import { useEffect, useId, useRef, type ReactNode } from 'react';

import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Bottoni in fondo (es. Annulla / Conferma). */
  footer?: ReactNode;
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Sincronizza lo stato React con il DOM: useEffect gira dopo il render.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      // Il focus viene restituito automaticamente all'elemento che ha aperto il dialog.
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      // "cancel" scatta con Esc: lasciamo decidere al genitore chiudendo tramite onClose.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {open && (
        <div className={styles.content}>
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
              ×
            </button>
          </header>
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
