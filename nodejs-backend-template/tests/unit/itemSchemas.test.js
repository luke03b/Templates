// Unit test dello schema di validazione dell'input degli item.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { itemInputSchema } from '../../src/schemas/itemSchemas.js';
import { zodErrorToFieldErrors } from '../../src/utils/zodErrors.js';

/** Esegue la validazione e restituisce gli errori nel formato dell'API (o null se valido). */
function errorsOf(input) {
  const result = itemInputSchema.safeParse(input);
  return result.success ? null : zodErrorToFieldErrors(result.error);
}

describe('itemInputSchema', () => {
  it('trims the name, defaults description to null and strips unknown fields', () => {
    const data = itemInputSchema.parse({ name: '  Lamp  ', price: 0, id: 'hacked' });

    assert.deepEqual(data, { name: 'Lamp', description: null, price: 0 });
  });

  it('reports missing required fields with the contract messages', () => {
    assert.deepEqual(errorsOf({}), {
      name: ['name is required'],
      price: ['price is required'],
    });
  });

  it('rejects wrong types', () => {
    assert.deepEqual(errorsOf({ name: 42, description: 1, price: '10' }), {
      name: ['name must be a string'],
      description: ['description must be a string or null'],
      price: ['price must be a number'],
    });
  });

  it('enforces lengths and minimum price', () => {
    assert.deepEqual(errorsOf({ name: '   ', price: -1 }), {
      name: ['name must not be empty'],
      price: ['price must be greater than or equal to 0'],
    });
    assert.deepEqual(errorsOf({ name: 'x'.repeat(101), description: 'y'.repeat(501), price: 1 }), {
      name: ['name must be at most 100 characters'],
      description: ['description must be at most 500 characters'],
    });
  });

  it('accepts boundary values', () => {
    assert.equal(errorsOf({ name: 'x'.repeat(100), description: 'y'.repeat(500), price: 0 }), null);
  });

  it('rejects a body that is not an object', () => {
    assert.deepEqual(errorsOf([1, 2]), { body: ['body must be a JSON object'] });
  });
});
