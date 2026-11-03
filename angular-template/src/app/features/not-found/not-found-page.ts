// Pagina 404: mostrata per qualsiasi URL che non corrisponde a una rotta (path '**').
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { EmptyState } from '../../shared/ui/empty-state/empty-state';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, MatButtonModule, EmptyState],
  template: `
    <div class="app-container">
      <app-empty-state
        icon="explore_off"
        title="404 · Page not found"
        message="The page you are looking for does not exist or has been moved."
      >
        <a matButton="filled" routerLink="/">Back to home</a>
      </app-empty-state>
    </div>
  `,
})
export class NotFoundPage {}
