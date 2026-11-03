// Pagina lista degli items: tabella con modifica ed eliminazione, stati di loading/errore/vuoto.
import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { toApiError } from '../../core/http/problem-details';
import { Item } from '../../core/models/item';
import { NotificationService } from '../../core/notifications/notification-service';
import { Alert } from '../../shared/ui/alert/alert';
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog/confirm-dialog';
import { EmptyState } from '../../shared/ui/empty-state/empty-state';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { ItemsStore } from './items-store';

@Component({
  selector: 'app-items-list-page',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule,
    Alert,
    EmptyState,
    PageHeader,
  ],
  templateUrl: './items-list-page.html',
  styleUrl: './items-list-page.scss',
})
export class ItemsListPage implements OnInit {
  protected readonly store = inject(ItemsStore);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);

  protected readonly columns = ['name', 'description', 'price', 'updatedAt', 'actions'];

  ngOnInit(): void {
    void this.store.load();
  }

  protected reload(): void {
    void this.store.load();
  }

  protected async remove(item: Item): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete item',
      message: `Delete "${item.name}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    try {
      await this.store.remove(item.id);
      this.notifications.success(`"${item.name}" deleted`);
    } catch (error) {
      const apiError = toApiError(error);
      // 5xx e rete sono gia' notificati dall'interceptor; qui gestiamo i 4xx (es. 404).
      if (apiError.status > 0 && apiError.status < 500) {
        this.notifications.error(apiError.message);
      }
      if (apiError.isNotFound) {
        void this.store.load();
      }
    }
  }
}
