// Test del form item: validazione locale, emissione del valore e errori del server.
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemInput } from '../../../core/models/item';
import { ItemForm } from './item-form';

describe('ItemForm', () => {
  let fixture: ComponentFixture<ItemForm>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ItemForm] }).compileComponents();
    fixture = TestBed.createComponent(ItemForm);
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  function type(selector: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function submit(): Promise<void> {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  it('shows validation errors and does not emit when invalid', async () => {
    const saved: ItemInput[] = [];
    fixture.componentInstance.save.subscribe((value) => saved.push(value));

    await submit();

    expect(saved).toEqual([]);
    expect(element.querySelectorAll('mat-error').length).toBe(2);
    expect(element.textContent).toContain('This field is required.');
  });

  it('emits a trimmed ItemInput when valid', async () => {
    const saved: ItemInput[] = [];
    fixture.componentInstance.save.subscribe((value) => saved.push(value));

    type('input[formControlName="name"]', '  Keyboard  ');
    type('input[formControlName="price"]', '12.5');
    await submit();

    expect(saved).toEqual([{ name: 'Keyboard', description: null, price: 12.5 }]);
  });

  it('shows server-side validation errors on the matching fields', async () => {
    fixture.componentRef.setInput('serverErrors', {
      price: ['price must be greater than or equal to 0'],
    });
    await fixture.whenStable();

    expect(element.querySelector('mat-error')?.textContent).toContain(
      'price must be greater than or equal to 0',
    );
  });
});
