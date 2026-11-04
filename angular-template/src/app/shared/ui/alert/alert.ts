// Alert inline riutilizzabile (info / success / warning / error) per messaggi in pagina.
import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type AlertKind = 'info' | 'success' | 'warning' | 'error';

const ICONS: Record<AlertKind, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

@Component({
  selector: 'app-alert',
  imports: [MatIconModule],
  host: {
    // Gli errori vengono annunciati subito dagli screen reader, gli altri in modo "educato".
    '[attr.role]': "kind() === 'error' ? 'alert' : 'status'",
    '[class]': "'app-alert app-alert-' + kind()",
  },
  template: `
    <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
    <div class="app-alert-body">
      @if (title()) {
        <strong>{{ title() }}</strong>
      }
      <ng-content />
    </div>
    <ng-content select="[alertActions]" />
  `,
  styles: `
    :host {
      display: flex;
      gap: var(--app-space-3);
      align-items: flex-start;
      padding: var(--app-space-3) var(--app-space-4);
      border-radius: var(--app-radius-md);
      border: 1px solid var(--app-alert-border);
      background: var(--app-alert-bg);
      color: var(--app-alert-fg);
    }
    .app-alert-body {
      flex: 1;
      display: grid;
      gap: var(--app-space-1);
    }
    :host(.app-alert-info) {
      --app-alert-bg: var(--app-color-info-container);
      --app-alert-fg: var(--app-color-on-info-container);
      --app-alert-border: var(--app-color-info);
    }
    :host(.app-alert-success) {
      --app-alert-bg: var(--app-color-success-container);
      --app-alert-fg: var(--app-color-on-success-container);
      --app-alert-border: var(--app-color-success);
    }
    :host(.app-alert-warning) {
      --app-alert-bg: var(--app-color-warning-container);
      --app-alert-fg: var(--app-color-on-warning-container);
      --app-alert-border: var(--app-color-warning);
    }
    :host(.app-alert-error) {
      --app-alert-bg: var(--mat-sys-error-container);
      --app-alert-fg: var(--mat-sys-on-error-container);
      --app-alert-border: var(--mat-sys-error);
    }
  `,
})
export class Alert {
  // input() crea un input del componente come signal: nel template si legge con kind().
  readonly kind = input<AlertKind>('info');
  readonly title = input<string>();

  protected readonly icon = computed(() => ICONS[this.kind()]);
}
