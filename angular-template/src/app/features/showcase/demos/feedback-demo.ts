// Demo: alert inline, toast (snackbar), badge, chip, spinner e progress bar.
import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NotificationService } from '../../../core/notifications/notification-service';
import { Alert } from '../../../shared/ui/alert/alert';
import { ShowcaseSection } from '../../../shared/ui/showcase-section/showcase-section';

const CODE = `<!-- Alert inline: shared/ui/alert -->
<app-alert kind="success" title="Saved">Your changes have been saved.</app-alert>

<!-- Toast: core/notifications/notification-service -->
private readonly notifications = inject(NotificationService);
this.notifications.success('Item saved');

<!-- Badge, chip, spinner, progress -->
<mat-icon matBadge="4" aria-hidden="false" aria-label="4 notifications">notifications</mat-icon>
<mat-chip-set><mat-chip>Angular</mat-chip></mat-chip-set>
<mat-spinner diameter="32" />
<mat-progress-bar mode="indeterminate" />`;

@Component({
  selector: 'app-feedback-demo',
  imports: [
    MatBadgeModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    Alert,
    ShowcaseSection,
  ],
  template: `
    <app-showcase-section
      anchor="feedback"
      title="Feedback"
      description="Alerts, toasts, badges, chips, spinners and progress bars"
      [code]="code"
    >
      <div class="app-stack">
        <app-alert kind="info" title="Info">Informational message.</app-alert>
        <app-alert kind="success" title="Success">Your changes have been saved.</app-alert>
        <app-alert kind="warning" title="Warning">Check the data before continuing.</app-alert>
        <app-alert kind="error" title="Error">Something went wrong.</app-alert>

        <div class="app-row">
          <button matButton="tonal" (click)="notifications.info('Informational toast')">
            Info toast
          </button>
          <button matButton="tonal" (click)="notifications.success('Item saved')">
            Success toast
          </button>
          <button matButton="tonal" (click)="notifications.error('Something went wrong')">
            Error toast
          </button>
        </div>

        <div class="app-row">
          <mat-icon matBadge="4" aria-hidden="false" aria-label="4 notifications">
            notifications
          </mat-icon>
          <mat-chip-set aria-label="Technologies">
            <mat-chip>Angular</mat-chip>
            <mat-chip>Material</mat-chip>
            <mat-chip highlighted>Signals</mat-chip>
          </mat-chip-set>
          <mat-spinner diameter="32" aria-label="Loading" />
        </div>

        <mat-progress-bar mode="determinate" value="60" aria-label="Upload progress" />
        <mat-progress-bar mode="indeterminate" aria-label="Loading" />
      </div>
    </app-showcase-section>
  `,
})
export class FeedbackDemo {
  protected readonly notifications = inject(NotificationService);
  protected readonly code = CODE;
}
