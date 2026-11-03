// Pagina Home: presentazione del template e stato del backend (GET /api/health).
import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { BackendStatusStore } from '../../core/state/backend-status-store';
import { LoadingButton } from '../../shared/ui/loading-button/loading-button';
import { StatusIndicator } from '../../shared/ui/status-indicator/status-indicator';

@Component({
  selector: 'app-home-page',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    LoadingButton,
    StatusIndicator,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  // La pagina legge lo stato dallo store: non sa nulla di HTTP.
  protected readonly backend = inject(BackendStatusStore);

  protected refresh(): void {
    void this.backend.check();
  }
}
