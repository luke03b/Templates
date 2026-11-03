/** Unit test della lettura e validazione della configurazione. */
import { describe, expect, it } from 'vitest';
import { ConfigError, DEFAULT_CORS_ORIGINS, loadConfig } from '../../src/config/env.ts';

describe('loadConfig', () => {
  it('applies defaults when variables are missing or empty', () => {
    const config = loadConfig({ PORT: '' });

    expect(config).toEqual({
      nodeEnv: 'development',
      host: '0.0.0.0',
      port: 3001,
      logLevel: 'info',
      corsOrigins: DEFAULT_CORS_ORIGINS.split(','),
    });
  });

  it('parses and converts provided values', () => {
    const config = loadConfig({
      NODE_ENV: 'production',
      PORT: '8080',
      LOG_LEVEL: 'debug',
      CORS_ORIGINS: 'http://a.test, http://b.test ,',
    });

    expect(config.port).toBe(8080);
    expect(config.logLevel).toBe('debug');
    expect(config.corsOrigins).toEqual(['http://a.test', 'http://b.test']);
  });

  it('accepts "*" to allow every origin', () => {
    expect(loadConfig({ CORS_ORIGINS: '*' }).corsOrigins).toBe(true);
  });

  it.each([{ PORT: 'abc' }, { PORT: '70000' }, { LOG_LEVEL: 'verbose' }])(
    'throws ConfigError for invalid values %o',
    (env) => {
      expect(() => loadConfig(env)).toThrow(ConfigError);
    },
  );
});
