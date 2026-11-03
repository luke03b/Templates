// Tabella degli item con le azioni Modifica/Elimina. Componente presentazionale:
// riceve i dati e i callback dalla pagina, non sa nulla di HTTP o cache.
import { Button, Table, type TableColumn } from '@/components/ui';
import { formatDateTime, formatPrice } from '@/lib/format';

import type { Item } from '../itemTypes';

export interface ItemTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export function ItemTable({ items, onEdit, onDelete }: ItemTableProps) {
  const columns: TableColumn<Item>[] = [
    { key: 'name', header: 'Name', render: (item) => <strong>{item.name}</strong> },
    {
      key: 'description',
      header: 'Description',
      render: (item) => item.description ?? <span aria-label="No description">—</span>,
    },
    { key: 'price', header: 'Price', align: 'right', render: (item) => formatPrice(item.price) },
    { key: 'updatedAt', header: 'Updated', render: (item) => formatDateTime(item.updatedAt) },
    {
      key: 'actions',
      header: <span className="visually-hidden">Actions</span>,
      align: 'right',
      render: (item) => (
        <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.name}`}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(item)}
            aria-label={`Delete ${item.name}`}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      caption="Items"
      columns={columns}
      rows={items}
      getRowKey={(item) => item.id}
      emptyMessage="No items yet. Create the first one."
    />
  );
}
