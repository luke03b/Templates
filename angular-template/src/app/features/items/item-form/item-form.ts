// Form presentazionale di un item (Reactive Forms tipizzati). Non fa HTTP: emette `save` con
// un ItemInput valido e mostra gli errori di validazione (locali e del server).
import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Item, ItemInput } from '../../../core/models/item';
import { AppValidators } from '../../../shared/forms/app-validators';
import { ErrorMessagePipe } from '../../../shared/forms/error-message-pipe';
import { applyServerErrors } from '../../../shared/forms/server-errors';
import { LoadingButton } from '../../../shared/ui/loading-button/loading-button';

/** Limiti uguali a quelli del contratto API (il backend li ricontrolla comunque). */
export const ITEM_LIMITS = { nameMax: 100, descriptionMax: 500, priceMin: 0 } as const;

@Component({
  selector: 'app-item-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ErrorMessagePipe,
    LoadingButton,
  ],
  templateUrl: './item-form.html',
  styleUrl: './item-form.scss',
})
export class ItemForm {
  // NonNullableFormBuilder: i controlli tornano al valore iniziale con reset() invece che a null.
  private readonly fb = inject(NonNullableFormBuilder);

  /** Item da modificare; null = creazione. */
  readonly item = input<Item | null>(null);
  /** Errori di validazione del server (Problem Details `errors`) da mostrare sui campi. */
  readonly serverErrors = input<Record<string, string[]> | null>(null);
  readonly saving = input(false);
  readonly submitLabel = input('Save');

  /** output(): evento emesso verso il componente padre. */
  readonly save = output<ItemInput>();
  readonly cancelled = output<void>();

  protected readonly limits = ITEM_LIMITS;

  /** Il tipo del form e' dedotto: form.value.price e' `number | null`, name e' `string`. */
  protected readonly form = this.fb.group({
    name: ['', [AppValidators.notBlank, Validators.maxLength(ITEM_LIMITS.nameMax)]],
    description: ['', [Validators.maxLength(ITEM_LIMITS.descriptionMax)]],
    price: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(ITEM_LIMITS.priceMin),
    ]),
  });

  constructor() {
    // effect(): esegue il codice ogni volta che cambiano i signal letti al suo interno.
    effect(() => {
      const item = this.item();
      this.form.reset({
        name: item?.name ?? '',
        description: item?.description ?? '',
        price: item?.price ?? null,
      });
    });

    effect(() => {
      const errors = this.serverErrors();
      if (errors) {
        applyServerErrors(this.form, errors);
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      // Mostra subito tutti gli errori anche sui campi non ancora toccati.
      this.form.markAllAsTouched();
      return;
    }

    const { name, description, price } = this.form.getRawValue();
    this.save.emit({
      name: name.trim(),
      description: description.trim() || null,
      price: price ?? 0,
    });
  }
}
