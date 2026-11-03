// Configurazione di Vite (dev server + build) e di Vitest (test runner).
// Vitest legge la sezione `test` di questo stesso file, cosi' alias e plugin sono condivisi.
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Backend a cui il dev server inoltra le chiamate /api (vedi docs/api-contract.md).
// Si cambia senza toccare il codice: API_PROXY_TARGET=http://localhost:8080 npm run dev
const apiProxyTarget = process.env.API_PROXY_TARGET || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Ogni richiesta che inizia con /api viene girata al backend: niente CORS in sviluppo.
      '/api': { target: apiProxyTarget, changeOrigin: true },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      '/api': { target: apiProxyTarget, changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: { modules: { classNameStrategy: 'non-scoped' } },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}', 'src/vite-env.d.ts'],
    },
  },
});
