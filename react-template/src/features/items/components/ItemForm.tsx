// Form di creazione/modifica di un item con react-hook-form + Zod.
// - react-hook-form gestisce valori, "touched" e submit senza ri-renderizzare a ogni tasto;
// - zodResolver collega lo schema Zod: gli errori di validazione finiscono in formState.errors;
// - se il backend risponde 400, applyServerErrors mostra i suoi messaggi sugli stessi campi.
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Alert, Button, Input, Textarea } from '@/components/ui';
import { applyServerErrors } from '@/lib/formErrors';

import {
  emptyItemFormValues,
  itemFormSchema,
  toItemInput,
  type ItemFormOutput,
  type ItemFormValues,
} from '../itemSchema';
import type { Item, ItemInput } from '../itemTypes';

const FIELD_NAMES = ['name', 'description', 'price'] as const;

export interface ItemFormProps {
  /** Item da modificare; se assente il form e' in modalita' "crea". */
  item?: Item | undefined;
  /** Chiamata con i dati validati. Se lancia un ApiError, gli errori vengono mostrati nel form. */
  onSubmit: (input: ItemInput) => Promise<void>;
  onCancel: () => void;
}

function toFormValues(item?: Item): ItemFormValues {
  if (!item) return emptyItemFormValues;
  return { name: item.name, description: item.description ?? '', price: String(item.price) };
}

export function ItemForm({ item, onSubmit, onCancel }: ItemFormProps) {
  // I tre generici sono: valori grezzi del form, contesto (non usato), valori validati.
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues, unknown, ItemFormOutput>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: toFormValues(item),
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(toItemInput(values));
    } catch (error) {
      applyServerErrors(error, setError, FIELD_NAMES);
    }
  });

  return (
    // noValidate: disattiva i fumetti di validazione del browser, usiamo i nostri messaggi.
    <form onSubmit={submit} noValidate aria-label={item ? 'Edit item' : 'Create item'}>
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {errors.root?.serverError && (
          <Alert variant="danger" title="Could not save the item">
            {errors.root.serverError.message}
          </Alert>
        )}
        <Input label="Name" required autoFocus {...register('name')} error={errors.name?.message} />
        <Textarea
          label="Description"
          hint="Optional, up to 500 characters."
          rows={3}
          {...register('description')}
          error={errors.description?.message}
        />
        <Input
          label="Price"
          required
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          {...register('price')}
          error={errors.price?.message}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {item ? 'Save changes' : 'Create item'}
          </Button>
        </div>
      </div>
    </form>
  );
}
