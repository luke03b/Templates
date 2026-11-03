// Dialog di conferma riutilizzabile (MatDialog) + servizio che lo apre e restituisce una Promise.
import { Component, Injectable, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Colora il bottone di conferma come azione distruttiva (es. eliminazione). */
  destructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton [mat-dialog-close]="false">{{ data.cancelLabel ?? 'Cancel' }}</button>
      <button
        matButton="filled"
        [class.app-button-danger]="data.destructive"
        [mat-dialog-close]="true"
        cdkFocusInitial
      >
        {{ data.confirmLabel ?? 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialog {
  // MAT_DIALOG_DATA contiene l'oggetto passato a dialog.open(..., { data }).
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly dialog = inject(MatDialog);

  /** Apre il dialog e risolve `true` solo se l'utente conferma. */
  async confirm(data: ConfirmDialogData): Promise<boolean> {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data,
      width: '420px',
      maxWidth: 'calc(100vw - 32px)',
    });
    return (await firstValueFrom(ref.afterClosed())) === true;
  }
}
