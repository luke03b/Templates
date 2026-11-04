// Configurazione ESLint in formato "flat config" (eslint.config.js), lo standard da ESLint 9 in poi.
// Ogni oggetto dell'array si applica ai file indicati in "files" (o a tutti se assente).
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // File e cartelle da non analizzare.
  { ignores: ['node_modules/', 'coverage/'] },

  // Regole consigliate di ESLint (errori comuni: variabili non usate, codice irraggiungibile, ...).
  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // Variabili globali disponibili in Node.js (process, console, ...).
      globals: { ...globals.node },
    },
    rules: {
      // Gli argomenti che iniziano con "_" sono volutamente inutilizzati (es. "_req" negli handler Express).
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      'no-console': 'error',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
    },
  },

  // Disattiva le regole di stile che andrebbero in conflitto con Prettier (va messo per ultimo).
  prettier,
];
