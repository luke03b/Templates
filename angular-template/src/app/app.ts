// Componente radice ("shell"): toolbar responsive, menu mobile e <router-outlet> per le pagine.
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { BackendStatusStore } from './core/state/backend-status-store';
import { NAV_LINKS } from './nav-links';
import { StatusIndicator } from './shared/ui/status-indicator/status-indicator';

@Component({
  selector: 'app-root',
  // Componenti standalone: ogni componente dichiara qui cio' che usa nel suo template.
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    StatusIndicator,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly backendStatus = inject(BackendStatusStore);
  protected readonly navLinks = NAV_LINKS;
  protected readonly year = new Date().getFullYear();

  ngOnInit(): void {
    // Primo controllo dello stato del backend all'avvio (la Home permette di ripeterlo).
    void this.backendStatus.check();
  }
}
