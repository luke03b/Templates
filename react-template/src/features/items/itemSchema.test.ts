// Test dello schema Zod del form item (regole del contratto API).
import { describe, expect, it } from 'vitest';

import { itemFormSchema, toItemInput } from './itemSchema';

describe('itemFormSchema', () => {
  it('accepts valid values and converts price to a number', () => {
    const result = itemFormSchema.parse({ name: '  Lamp ', description: '', price: '12.5' });
    expect(result).toEqual({ name: 'Lamp', description: '', price: 12.5 });
    expect(toItemInput(result)).toEqual({ name: 'Lamp', description: null, price: 12.5 });
  });

  it.each([
    [{ name: '', description: '', price: '1' }, 'name', 'Name is required'],
    [
      { name: 'x'.repeat(101), description: '', price: '1' },
      'name',
      'Name must be at most 100 characters',
    ],
    [
      { name: 'A', description: 'x'.repeat(501), price: '1' },
      'description',
      'Description must be at most 500 characters',
    ],
    [{ name: 'A', description: '', price: '' }, 'price', 'Price is required'],
    [{ name: 'A', description: '', price: 'abc' }, 'price', 'Price must be a number'],
    [
      { name: 'A', description: '', price: '-1' },
      'price',
      'Price must be greater than or equal to 0',
    ],
  ])('rejects %o on %s', (values, field, message) => {
    const result = itemFormSchema.safeParse(values);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toContainEqual(
      expect.objectContaining({ path: [field], message }),
    );
  });
});
