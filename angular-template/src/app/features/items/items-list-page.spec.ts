// Test della pagina lista items con ApiClient finto (il resto e' reale: store, tabella, router).
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiClient } from '../../core/http/api-client';
import { ApiError } from '../../core/http/problem-details';
import { Item } from '../../core/models/item';
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog/confirm-dialog';
import { ItemsListPage } from './items-list-page';
import { ItemsStore } from './items-store';

const ITEMS: Item[] = [
  {
    id: '1',
    name: 'Keyboard',
    description: 'Mechanical keyboard',
    price: 79,
    createdAt: '2026-11-03T18:00:00Z',
    updatedAt: '2026-11-03T18:00:00Z',
  },
  {
    id: '2',
    name: 'Mouse',
    description: null,
    price: 25,
    createdAt: '2026-11-03T18:01:00Z',
    updatedAt: '2026-11-03T18:01:00Z',
  },
];

describe('ItemsListPage', () => {
  const api = { listItems: vi.fn(), deleteItem: vi.fn() };
  const confirmDialog = { confirm: vi.fn() };

  async function render(): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [ItemsListPage],
      providers: [
        provideRouter([]),
        ItemsStore,
        { provide: ApiClient, useValue: api },
        { provide: ConfirmDialogService, useValue: confirmDialog },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ItemsListPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    api.listItems.mockReset();
    api.deleteItem.mockReset();
  });

  it('renders the items in a table', async () => {
    api.listItems.mockReturnValue(of(ITEMS));
    const element = await render();

    const rows = element.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Keyboard');
    expect(rows[0].textContent).toContain('€79.00');
  });

  it('shows an empty state when there are no items', async () => {
    api.listItems.mockReturnValue(of([]));
    const element = await render();
    expect(element.textContent).toContain('No items yet');
  });

  it('shows an error alert when loading fails', async () => {
    api.listItems.mockReturnValue(throwError(() => new ApiError(0, 'Network error', 'Offline')));
    const element = await render();
    expect(element.querySelector('app-alert')?.textContent).toContain('Offline');
  });

  it('deletes an item after confirmation', async () => {
    api.listItems.mockReturnValue(of(ITEMS));
    api.deleteItem.mockReturnValue(of(undefined));
    confirmDialog.confirm.mockResolvedValue(true);
    const element = await render();

    element.querySelector<HTMLButtonElement>('button[aria-label="Delete Keyboard"]')!.click();
    await vi.waitFor(() => expect(api.deleteItem).toHaveBeenCalledWith('1'));
    await vi.waitFor(() => expect(element.querySelectorAll('tr[mat-row]').length).toBe(1));
  });
});
