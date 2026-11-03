// Intestazione standard di pagina: titolo, sottotitolo opzionale e slot per azioni a destra.
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="text">
      <h1 class="app-text-headline">{{ title() }}</h1>
      @if (subtitle()) {
        <p class="subtitle">{{ subtitle() }}</p>
      }
    </div>
    <div class="actions"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--app-space-3);
      margin-bottom: var(--app-space-5);
    }
    h1 {
      margin: 0;
    }
    .subtitle {
      margin: var(--app-space-1) 0 0;
      color: var(--mat-sys-on-surface-variant);
    }
    .actions {
      display: flex;
      gap: var(--app-space-2);
    }
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
