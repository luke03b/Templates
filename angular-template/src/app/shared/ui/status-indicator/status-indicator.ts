// Indicatore di stato: pallino colorato + etichetta ("Online" verde, "Offline" rosso).
import { Component, computed, input } from '@angular/core';

import { BackendStatus } from '../../../core/state/backend-status-store';

const LABELS: Record<BackendStatus, string> = {
  checking: 'Checking…',
  online: 'Online',
  offline: 'Offline',
};

@Component({
  selector: 'app-status-indicator',
  host: { role: 'status', '[attr.aria-label]': "'Backend status: ' + label()" },
  template: `
    <span [class]="'dot dot-' + status()" aria-hidden="true"></span>
    <span class="label">{{ label() }}</span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--app-space-2);
      font: var(--mat-sys-label-large);
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--mat-sys-outline);
    }
    .dot-online {
      background: var(--app-color-success);
    }
    .dot-offline {
      background: var(--mat-sys-error);
    }
  `,
})
export class StatusIndicator {
  readonly status = input.required<BackendStatus>();
  protected readonly label = computed(() => LABELS[this.status()]);
}
