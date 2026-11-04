// Blocco di codice comprimibile con bottone "Copy" (CDK Clipboard), usato dallo showcase.
import { Component, inject, input } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

import { NotificationService } from '../../../core/notifications/notification-service';

@Component({
  selector: 'app-code-snippet',
  imports: [ClipboardModule, MatButtonModule, MatExpansionModule, MatIconModule],
  template: `
    <mat-expansion-panel>
      <mat-expansion-panel-header>
        <mat-panel-title>
          <mat-icon aria-hidden="true">code</mat-icon>
          {{ label() }}
        </mat-panel-title>
      </mat-expansion-panel-header>
      <div class="toolbar">
        <button
          matButton
          [cdkCopyToClipboard]="code()"
          (cdkCopyToClipboardCopied)="onCopied($event)"
        >
          <mat-icon>content_copy</mat-icon>
          Copy
        </button>
      </div>
      <pre><code>{{ code() }}</code></pre>
    </mat-expansion-panel>
  `,
  styles: `
    mat-panel-title {
      gap: var(--app-space-2);
    }
    .toolbar {
      display: flex;
      justify-content: flex-end;
    }
    pre {
      margin: 0;
      padding: var(--app-space-3);
      overflow-x: auto;
      border-radius: var(--app-radius-sm);
      background: var(--mat-sys-surface-container-highest);
      font: 13px/1.5 var(--app-font-mono);
    }
  `,
})
export class CodeSnippet {
  private readonly notifications = inject(NotificationService);

  readonly code = input.required<string>();
  readonly label = input('Show code');

  protected onCopied(success: boolean): void {
    if (success) {
      this.notifications.success('Code copied to clipboard');
    } else {
      this.notifications.error('Unable to copy the code');
    }
  }
}
