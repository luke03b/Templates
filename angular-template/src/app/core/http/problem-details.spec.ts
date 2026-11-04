// Test delle funzioni pure di conversione degli errori.
import { HttpErrorResponse } from '@angular/common/http';

import { ApiError, isProblemDetails, toApiError } from './problem-details';

describe('problem-details', () => {
  it('recognises a Problem Details body', () => {
    expect(isProblemDetails({ title: 'Not found', status: 404 })).toBe(true);
    expect(isProblemDetails({ message: 'nope' })).toBe(false);
    expect(isProblemDetails(null)).toBe(false);
  });

  it('maps a 400 validation problem to field errors', () => {
    const error = toApiError(
      new HttpErrorResponse({
        status: 400,
        error: {
          type: 'about:blank',
          title: 'Validation failed',
          status: 400,
          detail: 'One or more fields are invalid.',
          errors: { name: ['name is required'] },
        },
      }),
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error.isValidationError).toBe(true);
    expect(error.fieldErrors).toEqual({ name: ['name is required'] });
    expect(error.message).toBe('One or more fields are invalid.');
  });

  it('maps a 404 problem', () => {
    const error = toApiError(
      new HttpErrorResponse({ status: 404, error: { title: 'Item not found', status: 404 } }),
    );
    expect(error.isNotFound).toBe(true);
    expect(error.isValidationError).toBe(false);
    expect(error.message).toBe('Item not found');
  });

  it('maps a network error (status 0)', () => {
    const error = toApiError(
      new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') }),
    );
    expect(error.isNetworkError).toBe(true);
  });

  it('maps a non-problem HTTP error and unknown values', () => {
    expect(
      toApiError(new HttpErrorResponse({ status: 502, statusText: 'Bad Gateway' })).status,
    ).toBe(502);
    expect(toApiError('boom').title).toBe('Unexpected error');
  });
});
