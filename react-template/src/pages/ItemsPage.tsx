// Pagina Items: orchestra lista, creazione, modifica ed eliminazione.
// La pagina decide COSA mostrare (modali, toast, stati di caricamento/errore);
// il COME parlare col backend sta negli hook di features/items (TanStack Query + itemsApi).
import { useState } from 'react';

import { getErrorMessage } from '@/api/httpClient';
import { PageHeader } from '@/components/PageHeader';
import { Alert, Button, Modal, Spinner, useToast } from '@/components/ui';
import { ItemForm } from '@/features/items/components/ItemForm';
import { ItemTable } from '@/features/items/components/ItemTable';
import type { Item, ItemInput } from '@/features/items/itemTypes';
import { useCreateItem, useDeleteItem, useItems, useUpdateItem } from '@/features/items/useItems';

/** Stato del modale del form: chiuso, in creazione o in modifica di un item. */
type FormState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; item: Item };

export function ItemsPage() {
  const { data: items, isPending, isError, error, refetch } = useItems();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const { showToast } = useToast();

  const [formState, setFormState] = useState<FormState>({ mode: 'closed' });
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const closeForm = () => setFormState({ mode: 'closed' });
  const editingItem = formState.mode === 'edit' ? formState.item : undefined;

  // Se mutateAsync lancia, l'errore torna a ItemForm che lo mostra sui campi.
  const handleSubmit = async (input: ItemInput) => {
    if (editingItem) {
      await updateItem.mutateAsync({ id: editingItem.id, input });
      showToast({ title: 'Item updated', description: input.name, variant: 'success' });
    } else {
      await createItem.mutateAsync(input);
      showToast({ title: 'Item created', description: input.name, variant: 'success' });
    }
    closeForm();
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItem.mutateAsync(itemToDelete.id);
      showToast({ title: 'Item deleted', description: itemToDelete.name, variant: 'success' });
    } catch (deleteError) {
      showToast({
        title: 'Delete failed',
        description: getErrorMessage(deleteError),
        variant: 'danger',
      });
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Items"
        description="Example CRUD resource backed by /api/items."
        actions={<Button onClick={() => setFormState({ mode: 'create' })}>New item</Button>}
      />

      {isPending && <Spinner label="Loading items" />}

      {isError && (
        <Alert variant="danger" title="Could not load items">
          <p>{getErrorMessage(error)}</p>
          <Button size="sm" variant="secondary" onClick={() => void refetch()}>
            Retry
          </Button>
        </Alert>
      )}

      {items && (
        <ItemTable
          items={items}
          onEdit={(item) => setFormState({ mode: 'edit', item })}
          onDelete={setItemToDelete}
        />
      )}

      <Modal
        open={formState.mode !== 'closed'}
        title={editingItem ? 'Edit item' : 'New item'}
        onClose={closeForm}
      >
        {/* key: ricrea il form (e i suoi valori iniziali) quando cambia l'item modificato. */}
        <ItemForm
          key={editingItem?.id ?? 'new'}
          item={editingItem}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <Modal
        open={itemToDelete !== null}
        title="Delete item"
        onClose={() => setItemToDelete(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleteItem.isPending} onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <strong>{itemToDelete?.name}</strong>? This action cannot
          be undone.
        </p>
      </Modal>
    </>
  );
}
