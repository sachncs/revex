/**
 * Shared ESLint 9 flat config for @revex/* packages and the
 * @revex/cli app.
 *
 * The web app (@revex/web) keeps its Next.js-aware config
 * (apps/web/eslint.config.mjs) because it pulls in
 * eslint-config-next. Everything else uses this base config.
 *
 * Usage from a package:
 *   // packages/<name>/eslint.config.mjs
 *   import base from '../../eslint.base.config.mjs';
 *   export default [
 *     ...base,
 *     { ignores: ['dist/**', '.turbo/**'] },
 *   ];
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const base = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        globalThis: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        crypto: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
      },
    },
    rules: {
      /* The codebase uses `any` sparingly and only at narrow
       * boundaries; warn rather than error so the lint gate
       * surfaces new occurrences without breaking existing
       * builds. Tighten to 'error' after a cleanup sweep. */
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-undef': 'off', // typescript-eslint handles this
    },
  },
);

export default base;
