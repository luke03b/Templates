// Configurazione ESLint "flat" (formato standard da ESLint 9).
// - @eslint/js: regole consigliate per JavaScript;
// - typescript-eslint: regole che usano le informazioni di tipo di TypeScript
//   (es. promesse non gestite, uso di `any`);
// - eslint-config-prettier: spegne le regole di stile che farebbero a pugni con Prettier.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist/', 'coverage/', 'node_modules/'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Gli import di soli tipi devono essere espliciti (richiesto da verbatimModuleSyntax).
      '@typescript-eslint/consistent-type-imports': 'error',
      // Numeri e booleani nei template literal sono leggibili e sicuri.
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true },
      ],
      // Plugin Fastify e implementazioni in memoria di interfacce asincrone sono `async`
      // per contratto anche quando non contengono `await`.
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    // I file di configurazione JavaScript non hanno informazioni di tipo.
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
  prettier,
);
