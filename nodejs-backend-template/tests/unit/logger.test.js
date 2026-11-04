// Unit test della creazione del logger.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createLogger } from '../../src/config/logger.js';

describe('createLogger', () => {
  it('uses the configured level', () => {
    const logger = createLogger({ logLevel: 'warn', serviceName: 'test-service' });

    assert.equal(logger.level, 'warn');
    assert.equal(logger.isLevelEnabled('info'), false);
    assert.equal(logger.isLevelEnabled('error'), true);
  });
});
