// Unit test del middleware "validate" usato direttamente, senza Express.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { z } from 'zod';
import { validate } from '../../src/middlewares/validate.js';
import { ValidationError } from '../../src/utils/httpErrors.js';

/** Esegue il middleware e restituisce l'argomento passato a next(). */
function run(middleware, req) {
  /** @type {unknown} */
  let nextArg = 'not called';
  middleware(req, {}, (arg) => {
    nextArg = arg;
  });
  return nextArg;
}

describe('validate middleware', () => {
  const pageSchema = z.object({ page: z.coerce.number().int().min(1).default(1) });

  it('replaces req.query with the parsed data (Express 5 getter)', () => {
    const req = {};
    Object.defineProperty(req, 'query', { get: () => ({ page: '3' }), configurable: true });

    assert.equal(run(validate(pageSchema, 'query'), req), undefined);
    assert.deepEqual(req.query, { page: 3 });
  });

  it('passes a ValidationError keyed by field to next()', () => {
    const error = run(validate(pageSchema, 'query'), { query: { page: '0' } });

    assert.ok(error instanceof ValidationError);
    assert.deepEqual(Object.keys(error.errors), ['page']);
  });

  it('replaces req.body with the cleaned data', () => {
    const req = { body: { name: ' x ', extra: true } };

    run(validate(z.object({ name: z.string().trim() })), req);

    assert.deepEqual(req.body, { name: 'x' });
  });
});
