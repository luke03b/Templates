// Pagina contenitore per creare (/items/new) o modificare (/items/:id/edit) un item.
// Orchestra: carica l'item, passa i dati al form, salva tramite lo store, gestisce gli errori.
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ApiError, toApiError } from '../../core/http/problem-details';
import { Item, ItemInput } from '../../core/models/item';
import { NotificationService } from '../../core/notifications/notification-service';
import { Alert } from '../../shared/ui/alert/alert';
import { PageHeader } from '../../shared/ui/page-header/page-header';
import { ItemForm } from './item-form/item-form';
import { ItemsStore } from './items-store';

@Component({
  selector: 'app-item-edit-page',
  imports: [MatButtonModule, MatCardModule, MatProgressBarModule, Alert, PageHeader, ItemForm],
  templateUrl: './item-edit-page.html',
})
export class ItemEditPage implements OnInit {
  private readonly store = inject(ItemsStore);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  /** Parametro di rotta `:id` (assente su /items/new). */
  readonly id = input<string>();

  protected readonly isEdit = computed(() => !!this.id());
  protected readonly item = signal<Item | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly serverErrors = signal<Record<string, string[]> | null>(null);

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      void this.loadItem(id);
    }
  }

  protected async save(input: ItemInput): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    this.serverErrors.set(null);
    try {
      const id = this.id();
      const saved = id ? await this.store.update(id, input) : await this.store.create(input);
      this.notifications.success(`"${saved.name}" saved`);
      await this.router.navigate(['/items']);
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.isValidationError) {
        // 400: i messaggi vanno sui singoli campi del form.
        this.serverErrors.set(apiError.fieldErrors);
      }
      this.error.set(apiError);
    } finally {
      this.saving.set(false);
    }
  }

  protected cancel(): void {
    void this.router.navigate(['/items']);
  }

  private async loadItem(id: string): Promise<void> {
    this.loading.set(true);
    try {
      this.item.set(await this.store.getById(id));
    } catch (error) {
      this.error.set(toApiError(error));
    } finally {
      this.loading.set(false);
    }
  }
}
