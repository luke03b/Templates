// @ts-check
// Configurazione ESLint (formato "flat config"): regole TypeScript + regole Angular per
// componenti e template, piu' eslint-config-prettier che spegne le regole di stile in
// conflitto con Prettier (la formattazione e' compito di Prettier, non di ESLint).
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
      prettier,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      // Le variabili/argomenti che iniziano con "_" sono volutamente inutilizzati.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility, prettier],
    rules: {
      // Suggerisce il nuovo control flow (@if/@for) al posto di *ngIf/*ngFor.
      '@angular-eslint/template/prefer-control-flow': 'error',
    },
  },
]);
