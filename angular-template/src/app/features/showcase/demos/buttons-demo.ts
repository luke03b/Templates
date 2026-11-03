// Demo: varianti dei bottoni Material, icon button, FAB, disabled e bottone con loading.
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { LoadingButton } from '../../../shared/ui/loading-button/loading-button';
import { ShowcaseSection } from '../../../shared/ui/showcase-section/showcase-section';

const CODE = `<button matButton>Text</button>
<button matButton="filled">Filled</button>
<button matButton="tonal">Tonal</button>
<button matButton="outlined">Outlined</button>
<button matButton="elevated">Elevated</button>
<button matButton="filled" disabled>Disabled</button>
<button matButton="filled" class="app-button-danger">Danger</button>
<button matIconButton aria-label="Favorite"><mat-icon>favorite</mat-icon></button>
<button matFab aria-label="Add"><mat-icon>add</mat-icon></button>

<!-- Componente riutilizzabile con spinner: shared/ui/loading-button -->
<app-loading-button [loading]="saving()" (click)="save()">Save</app-loading-button>`;

@Component({
  selector: 'app-buttons-demo',
  imports: [MatButtonModule, MatIconModule, LoadingButton, ShowcaseSection],
  template: `
    <app-showcase-section
      anchor="buttons"
      title="Buttons"
      description="Variants, icon buttons, FAB, disabled and loading state"
      [code]="code"
    >
      <div class="app-stack">
        <div class="app-row">
          <button matButton>Text</button>
          <button matButton="filled">Filled</button>
          <button matButton="tonal">Tonal</button>
          <button matButton="outlined">Outlined</button>
          <button matButton="elevated">Elevated</button>
        </div>
        <div class="app-row">
          <button matButton="filled" disabled>Disabled</button>
          <button matButton="filled" class="app-button-danger">Danger</button>
          <button matIconButton aria-label="Favorite"><mat-icon>favorite</mat-icon></button>
          <button matFab aria-label="Add"><mat-icon>add</mat-icon></button>
          <app-loading-button [loading]="saving()" (click)="simulateSave()">
            {{ saving() ? 'Saving…' : 'Click to load' }}
          </app-loading-button>
        </div>
      </div>
    </app-showcase-section>
  `,
})
export class ButtonsDemo {
  protected readonly code = CODE;
  protected readonly saving = signal(false);

  protected simulateSave(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1500);
  }
}
