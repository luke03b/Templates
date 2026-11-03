// Unit test della lettura/validazione della configurazione.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ConfigError, DEFAULT_CORS_ORIGINS, loadConfig } from '../../src/config/env.js';

describe('loadConfig', () => {
  it('uses the contract defaults when variables are missing', () => {
    const config = loadConfig({});

    assert.equal(config.port, 3000);
    assert.equal(config.logLevel, 'info');
    assert.equal(config.nodeEnv, 'development');
    assert.deepEqual(config.corsOrigins, DEFAULT_CORS_ORIGINS);
    assert.equal(config.serviceName, 'nodejs-backend-template');
  });

  it('parses and trims the provided values', () => {
    const config = loadConfig({
      PORT: '8080',
      LOG_LEVEL: 'debug',
      CORS_ORIGINS: ' http://a.test , http://b.test ,',
    });

    assert.equal(config.port, 8080);
    assert.equal(config.logLevel, 'debug');
    assert.deepEqual(config.corsOrigins, ['http://a.test', 'http://b.test']);
  });

  it('treats empty variables as missing', () => {
    assert.equal(loadConfig({ PORT: '' }).port, 3000);
  });

  it('throws a ConfigError listing every invalid variable', () => {
    assert.throws(
      () => loadConfig({ PORT: 'abc', LOG_LEVEL: 'verbose' }),
      (error) => {
        assert.ok(error instanceof ConfigError);
        assert.equal(error.problems.length, 2);
        assert.match(error.message, /PORT/);
        assert.match(error.message, /LOG_LEVEL/);
        return true;
      },
    );
  });
});
