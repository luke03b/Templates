// Contenitore di un esempio dello showcase: card con titolo, descrizione, demo e codice copiabile.
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { CodeSnippet } from '../code-snippet/code-snippet';

@Component({
  selector: 'app-showcase-section',
  imports: [MatCardModule, CodeSnippet],
  host: { '[attr.id]': 'anchor()' },
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>{{ title() }}</mat-card-title>
        @if (description()) {
          <mat-card-subtitle>{{ description() }}</mat-card-subtitle>
        }
      </mat-card-header>
      <mat-card-content>
        <div class="demo"><ng-content /></div>
        @if (code()) {
          <app-code-snippet [code]="code()!" />
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      display: block;
      scroll-margin-top: 80px;
    }
    .demo {
      padding: var(--app-space-4) 0;
    }
  `,
})
export class ShowcaseSection {
  readonly title = input.required<string>();
  readonly description = input<string>();
  /** id HTML della sezione, usato per i link "#ancora" dell'indice. */
  readonly anchor = input<string>();
  readonly code = input<string>();
}
