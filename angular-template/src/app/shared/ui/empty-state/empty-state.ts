// Stato vuoto riutilizzabile: icona, messaggio e slot per un'azione (es. "Crea il primo elemento").
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  imports: [MatIconModule],
  template: `
    <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
    <p class="app-text-title">{{ title() }}</p>
    @if (message()) {
      <p class="message">{{ message() }}</p>
    }
    <ng-content />
  `,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      gap: var(--app-space-2);
      padding: var(--app-space-6) var(--app-space-4);
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
    }
    mat-icon {
      width: 48px;
      height: 48px;
      font-size: 48px;
    }
    p {
      margin: 0;
    }
  `,
})
export class EmptyState {
  readonly icon = input('inbox');
  readonly title = input.required<string>();
  readonly message = input<string>();
}
