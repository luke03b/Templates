// Configurazione ESLint in formato "flat config" (standard da ESLint 9 in poi).
// Ogni elemento dell'array aggiunge regole; l'ultimo (prettier) spegne le regole di stile
// che andrebbero in conflitto con Prettier, che si occupa da solo della formattazione.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      // Regole TypeScript che usano le informazioni di tipo (piu' precise, es. promise non gestite).
      tseslint.configs.recommendedTypeChecked,
      // Regole degli hook React (dipendenze di useEffect, regole del React Compiler...).
      reactHooks.configs.flat['recommended-latest'],
      // Hot Module Replacement: un file di componenti deve esportare solo componenti.
      reactRefresh.configs.vite(),
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Permette di passare funzioni async a onClick/onSubmit senza wrapper.
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  {
    files: ['eslint.config.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  prettier,
]);
