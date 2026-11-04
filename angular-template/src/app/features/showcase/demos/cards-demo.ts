// Demo: card Material con header, contenuto e azioni.
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ShowcaseSection } from '../../../shared/ui/showcase-section/showcase-section';

const CODE = `<mat-card appearance="outlined">
  <mat-card-header>
    <mat-icon mat-card-avatar>rocket_launch</mat-icon>
    <mat-card-title>Card title</mat-card-title>
    <mat-card-subtitle>Subtitle</mat-card-subtitle>
  </mat-card-header>
  <mat-card-content>Card content.</mat-card-content>
  <mat-card-actions align="end">
    <button matButton>Action</button>
  </mat-card-actions>
</mat-card>`;

@Component({
  selector: 'app-cards-demo',
  imports: [MatButtonModule, MatCardModule, MatIconModule, ShowcaseSection],
  template: `
    <app-showcase-section
      anchor="cards"
      title="Cards"
      description="Outlined and filled cards"
      [code]="code"
    >
      <div class="cards">
        @for (appearance of appearances; track appearance) {
          <mat-card [appearance]="appearance">
            <mat-card-header>
              <mat-icon mat-card-avatar aria-hidden="true">rocket_launch</mat-icon>
              <mat-card-title>{{ appearance }} card</mat-card-title>
              <mat-card-subtitle>appearance="{{ appearance }}"</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p>Cards group related content and actions about a single subject.</p>
            </mat-card-content>
            <mat-card-actions align="end">
              <button matButton>Action</button>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </app-showcase-section>
  `,
  styles: `
    .cards {
      display: grid;
      gap: var(--app-space-4);
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }
  `,
})
export class CardsDemo {
  protected readonly code = CODE;
  protected readonly appearances = ['outlined', 'raised', 'filled'] as const;
}
