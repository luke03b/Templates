// Bottone Material con stato di caricamento: mostra uno spinner e si disabilita mentre `loading`.
import { Component, input } from '@angular/core';
import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-button',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  template: `
    <button
      [matButton]="appearance()"
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading()"
    >
      @if (loading()) {
        <mat-spinner diameter="18" aria-hidden="true" />
      }
      <ng-content />
    </button>
  `,
  styles: `
    mat-spinner {
      display: inline-block;
      margin-right: var(--app-space-2);
      vertical-align: middle;
    }
  `,
})
export class LoadingButton {
  readonly appearance = input<MatButtonAppearance>('filled');
  readonly type = input<'button' | 'submit'>('button');
  readonly loading = input(false);
  readonly disabled = input(false);
}
