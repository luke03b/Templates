// Test della mappatura errori backend -> campi del form.
import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/httpClient';

import { applyServerErrors, ROOT_SERVER_ERROR } from './formErrors';

describe('applyServerErrors', () => {
  it('maps Problem Details field errors onto matching fields', () => {
    const setError = vi.fn();
    const error = new ApiError('Invalid', 400, {
      title: 'Validation failed',
      status: 400,
      errors: { name: ['name is required'], price: ['must be >= 0', 'must be a number'] },
    });

    applyServerErrors(error, setError, ['name', 'price']);

    expect(setError).toHaveBeenCalledWith('name', { type: 'server', message: 'name is required' });
    expect(setError).toHaveBeenCalledWith('price', {
      type: 'server',
      message: 'must be >= 0 must be a number',
    });
    expect(setError).not.toHaveBeenCalledWith(ROOT_SERVER_ERROR, expect.anything());
  });

  it('falls back to the root error for non-validation errors', () => {
    const setError = vi.fn();
    applyServerErrors(new ApiError('Server exploded', 500), setError, ['name']);
    expect(setError).toHaveBeenCalledWith(ROOT_SERVER_ERROR, {
      type: 'server',
      message: 'Server exploded',
    });
  });
});
