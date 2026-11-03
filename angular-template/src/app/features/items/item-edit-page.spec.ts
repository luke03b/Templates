// Test della pagina di creazione/modifica: salvataggio, navigazione ed errori Problem Details.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ApiClient } from '../../core/http/api-client';
import { ApiError } from '../../core/http/problem-details';
import { Item } from '../../core/models/item';
import { ItemEditPage } from './item-edit-page';
import { ItemsStore } from './items-store';

const ITEM: Item = {
  id: '1',
  name: 'Keyboard',
  description: null,
  price: 79,
  createdAt: '2026-11-03T18:00:00Z',
  updatedAt: '2026-11-03T18:00:00Z',
};

describe('ItemEditPage', () => {
  const api = { getItem: vi.fn(), createItem: vi.fn(), updateItem: vi.fn() };
  let fixture: ComponentFixture<ItemEditPage>;
  let element: HTMLElement;

  async function render(id?: string): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [ItemEditPage],
      providers: [provideRouter([]), ItemsStore, { provide: ApiClient, useValue: api }],
    }).compileComponents();
    fixture = TestBed.createComponent(ItemEditPage);
    if (id) {
      fixture.componentRef.setInput('id', id);
    }
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  }

  function type(selector: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  it('loads the item in edit mode', async () => {
    api.getItem.mockReturnValue(of(ITEM));
    await render('1');

    expect(api.getItem).toHaveBeenCalledWith('1');
    expect(element.querySelector<HTMLInputElement>('input[formControlName="name"]')?.value).toBe(
      'Keyboard',
    );
  });

  it('creates an item and navigates back to the list', async () => {
    api.createItem.mockReturnValue(of(ITEM));
    await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    type('input[formControlName="name"]', 'Keyboard');
    type('input[formControlName="price"]', '79');
    element.querySelector('form')!.dispatchEvent(new Event('submit'));

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith(['/items']));
    expect(api.createItem).toHaveBeenCalledWith({ name: 'Keyboard', description: null, price: 79 });
  });

  it('maps Problem Details validation errors onto the form fields', async () => {
    api.createItem.mockReturnValue(
      throwError(
        () =>
          new ApiError(400, 'Validation failed', 'One or more fields are invalid.', {
            name: ['name must be at most 100 characters'],
          }),
      ),
    );
    await render();

    type('input[formControlName="name"]', 'Keyboard');
    type('input[formControlName="price"]', '1');
    element.querySelector('form')!.dispatchEvent(new Event('submit'));

    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(element.querySelector('mat-error')?.textContent).toContain(
        'name must be at most 100 characters',
      );
    });
    expect(element.querySelector('app-alert')?.textContent).toContain('Validation failed');
  });
});
