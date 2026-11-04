// Test della pagina Items: lista, creazione, errori di validazione dal backend ed eliminazione.
// fetch e' sostituito da un finto backend in memoria, cosi' il test non dipende da un server vero.
import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Item } from '@/features/items/itemTypes';
import { jsonResponse, renderWithProviders } from '@/test/renderWithProviders';

import { ItemsPage } from './ItemsPage';

const NOW = '2026-11-03T18:00:00Z';

function makeItem(overrides: Partial<Item>): Item {
  return {
    id: '1',
    name: 'Item',
    description: null,
    price: 1,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

let items: Item[];
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

beforeEach(() => {
  items = [
    makeItem({ id: '1', name: 'Keyboard', price: 49.9 }),
    makeItem({ id: '2', name: 'Mouse', price: 19 }),
  ];

  fetchMock = vi.fn<typeof fetch>((input, init) => {
    const url = input instanceof Request ? input.url : input.toString();
    const method = init?.method ?? 'GET';

    if (url === '/api/items' && method === 'GET') return Promise.resolve(jsonResponse(items));
    if (url === '/api/items' && method === 'POST') {
      const body = JSON.parse(init?.body as string) as Item;
      if (body.name === 'Taken') {
        return Promise.resolve(
          jsonResponse(
            { title: 'Validation failed', status: 400, errors: { name: ['name already exists'] } },
            400,
            'application/problem+json',
          ),
        );
      }
      const created = makeItem({ ...body, id: '3' });
      items = [...items, created];
      return Promise.resolve(jsonResponse(created, 201));
    }
    if (url.startsWith('/api/items/') && method === 'DELETE') {
      items = items.filter((item) => !url.endsWith(`/${item.id}`));
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    return Promise.resolve(
      jsonResponse({ title: 'Not Found', status: 404 }, 404, 'application/problem+json'),
    );
  });
  vi.stubGlobal('fetch', fetchMock);
});

describe('ItemsPage', () => {
  it('lists the items returned by the API', async () => {
    renderWithProviders(<ItemsPage />);

    expect(await screen.findByText('Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Mouse')).toBeInTheDocument();
  });

  it('shows client-side validation errors and does not call the API', async () => {
    const { user } = renderWithProviders(<ItemsPage />);
    await screen.findByText('Keyboard');

    await user.click(screen.getByRole('button', { name: 'New item' }));
    await user.click(screen.getByRole('button', { name: 'Create item' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Price is required')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith(
      '/api/items',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('creates an item and refreshes the list', async () => {
    const { user } = renderWithProviders(<ItemsPage />);
    await screen.findByText('Keyboard');

    await user.click(screen.getByRole('button', { name: 'New item' }));
    const form = screen.getByRole('form', { name: 'Create item' });
    await user.type(within(form).getByLabelText(/name/i), 'Monitor');
    await user.type(within(form).getByLabelText(/price/i), '199');
    await user.click(within(form).getByRole('button', { name: 'Create item' }));

    expect(await screen.findByText('Item created')).toBeInTheDocument();
    expect(await screen.findByRole('cell', { name: 'Monitor' })).toBeInTheDocument();
  });

  it('shows Problem Details validation errors on the fields', async () => {
    const { user } = renderWithProviders(<ItemsPage />);
    await screen.findByText('Keyboard');

    await user.click(screen.getByRole('button', { name: 'New item' }));
    const form = screen.getByRole('form', { name: 'Create item' });
    await user.type(within(form).getByLabelText(/name/i), 'Taken');
    await user.type(within(form).getByLabelText(/price/i), '5');
    await user.click(within(form).getByRole('button', { name: 'Create item' }));

    expect(await within(form).findByText('name already exists')).toBeInTheDocument();
    expect(within(form).getByLabelText(/name/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('deletes an item after confirmation', async () => {
    const { user } = renderWithProviders(<ItemsPage />);
    await screen.findByText('Keyboard');

    await user.click(screen.getByRole('button', { name: 'Delete Keyboard' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete item' });
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(screen.queryByRole('cell', { name: 'Keyboard' })).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Item deleted')).toBeInTheDocument();
  });

  it('shows an error with a retry button when the list cannot be loaded', async () => {
    fetchMock.mockImplementation(() => Promise.reject(new TypeError('Failed to fetch')));
    renderWithProviders(<ItemsPage />);

    expect(await screen.findByText('Could not load items')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
