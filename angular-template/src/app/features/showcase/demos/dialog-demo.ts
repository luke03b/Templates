// Demo: dialog modale di conferma riutilizzabile (ConfirmDialogService).
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { ConfirmDialogService } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { ShowcaseSection } from '../../../shared/ui/showcase-section/showcase-section';

const CODE = `private readonly confirmDialog = inject(ConfirmDialogService);

async delete(): Promise<void> {
  const confirmed = await this.confirmDialog.confirm({
    title: 'Delete item',
    message: 'This action cannot be undone.',
    confirmLabel: 'Delete',
    destructive: true,
  });
  if (confirmed) { /* ... */ }
}`;

@Component({
  selector: 'app-dialog-demo',
  imports: [MatButtonModule, ShowcaseSection],
  template: `
    <app-showcase-section
      anchor="dialog"
      title="Dialog"
      description="Modal confirmation dialog returning a Promise<boolean>"
      [code]="code"
    >
      <div class="app-row">
        <button matButton="filled" (click)="open()">Open dialog</button>
        @if (result() !== null) {
          <span class="app-text-muted">Result: {{ result() ? 'confirmed' : 'cancelled' }}</span>
        }
      </div>
    </app-showcase-section>
  `,
})
export class DialogDemo {
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly code = CODE;
  protected readonly result = signal<boolean | null>(null);

  protected async open(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete item',
      message: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    this.result.set(confirmed);
  }
}
