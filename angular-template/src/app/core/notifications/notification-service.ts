// Servizio centrale per le notifiche "toast" (MatSnackBar di Angular Material).
// Pagine, store e interceptor lo usano invece di aprire snackbar direttamente.
import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export type NotificationKind = 'info' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // inject() e' il modo moderno di chiedere una dipendenza al DI di Angular
  // (alternativa al parametro nel costruttore).
  private readonly snackBar = inject(MatSnackBar);

  info(message: string): void {
    this.show(message, 'info');
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 6000);
  }

  private show(message: string, kind: NotificationKind, duration = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      // Classe CSS definita in styles.scss per colorare il toast in base al tipo.
      panelClass: `app-snackbar-${kind}`,
      // Gli errori vengono annunciati subito dagli screen reader.
      politeness: kind === 'error' ? 'assertive' : 'polite',
    });
  }
}
