/**
 * Configurazione unica di Vite (build di produzione) e Vitest (test).
 *
 * Build: `vite build` in modalita' SSR compila src/server.ts (e tutto cio' che importa)
 * in un singolo file ESM dist/server.js eseguibile con `node dist/server.js`.
 * In modalita' SSR Vite NON include nel bundle le dipendenze di node_modules
 * (fastify, pino, ...): restano import esterni e vanno installate in produzione
 * con `npm ci --omit=dev`. Nel bundle finisce solo il NOSTRO codice.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    ssr: 'src/server.ts',
    outDir: 'dist',
    emptyOutDir: true,
    // Sintassi JavaScript supportata da Node 24+ (nessuna transpilazione inutile).
    target: 'node24',
    // Il codice server non va minificato: stack trace e log restano leggibili.
    minify: false,
    sourcemap: true,
    rolldownOptions: {
      output: {
        format: 'es',
        entryFileNames: 'server.js',
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Ripristina automaticamente spy e mock tra un test e l'altro.
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // server.ts avvia il processo reale: viene verificato con l'avvio, non con i unit test.
      exclude: ['src/server.ts'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
