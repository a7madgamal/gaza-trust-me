/**
 * ESLint Configuration - Central Flat Config
 *
 * IMPORTANT: Always put common rules that apply to ALL packages in the base config.
 * Only put package-specific rules in individual package configs.
 *
 * TODO: Review and fix strict TypeScript rules later - currently set to 'warn'
 */

import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import playwright from 'eslint-plugin-playwright';
import eslintComments from 'eslint-plugin-eslint-comments';
import react from 'eslint-plugin-react';
// import vibeCoder from 'eslint-plugin-vibe-coder';

// Common TypeScript rules for all packages with tsconfig - REVIEW: Fix strict rules later
const TS_RULES = {
  ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-member-access': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-unsafe-return': 'error',
  '@typescript-eslint/no-redundant-type-constituents': 'error', // REVIEW: Remove redundant types
  '@typescript-eslint/no-floating-promises': 'error', // REVIEW: Fix floating promises
  '@typescript-eslint/require-await': 'error', // REVIEW: Fix async/await usage
  '@typescript-eslint/await-thenable': 'error', // REVIEW: Fix await on non-promises
  '@typescript-eslint/no-unsafe-argument': 'error', // REVIEW: Fix unsafe arguments
  '@typescript-eslint/no-misused-promises': 'error', // REVIEW: Fix promise usage in event handlers
  '@typescript-eslint/unbound-method': 'error', // REVIEW: Fix unbound methods
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // REVIEW: Fix unbound methods
  '@typescript-eslint/no-explicit-any': 'error', // REVIEW: Avoid 'any' type
  '@typescript-eslint/no-unsafe-type-assertion': 'error', // REVIEW: Avoid unsafe type assertions
  '@typescript-eslint/consistent-type-assertions': ['warn', { assertionStyle: 'never' }], // Warn about 'as' keyword usage
  '@typescript-eslint/no-non-null-assertion': 'error',
  ...eslintComments.configs.recommended.rules,
  'eslint-comments/disable-enable-pair': 'warn',
  'eslint-comments/no-restricted-disable': 'warn',
  'eslint-comments/no-use': 'warn',
};

// Common ignore patterns for all sections
const OVERRIDES = {
  ignores: [
    '**/*.d.ts',
    '**/*.d.ts',
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/*.d.ts.map',
    '**/*.js.map',
    '**/logs/**',
    '**/.env*',
    '**/env.example',
    '**/env-development',
    '**/env-prod',
    '**/env-test',
    '**/.eslintcache',
    '**/.tsbuildinfo',
  ],
};

export default [
  // Backend TypeScript files (with project-specific config)
  {
    files: ['packages/backend/**/*.{ts,tsx}'],
    ignores: [
      ...OVERRIDES.ignores,
      'packages/backend/vitest.config.ts',
      'packages/backend/scripts/*',
      'packages/backend/src/types/GENERATED_database.types.ts',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'eslint-comments': eslintComments,
    },
    rules: {
      ...TS_RULES,
    },
  },

  // Frontend TypeScript/React files (with project-specific config)
  {
    files: ['packages/frontend/**/*.{js,ts,tsx}'],
    ignores: [...OVERRIDES.ignores],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'eslint-comments': eslintComments,
      react: react,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.recommended.rules,
      ...TS_RULES,
      'react/jsx-no-bind': 'warn', // REVIEW: Avoid inline function creation in JSX
    },
  },

  // E2E TypeScript files (with project-specific config)
  {
    files: ['packages/e2e/**/*.{ts,tsx}'],
    ignores: [
      ...OVERRIDES.ignores,
      'packages/e2e/playwright-report/**',
      'packages/e2e/test-results/**',
      'packages/e2e/playwright.config.ts',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      playwright,
      'eslint-comments': eslintComments,
    },
    rules: {
      ...TS_RULES,
      ...playwright.configs.recommended.rules,
      'playwright/expect-expect': 'error',
      'playwright/no-conditional-in-test': 'warn',
      'playwright/no-wait-for-selector': 'error',
      // Prevent importing from @playwright/test directly - use global-test-hook instead
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@playwright/test'],
              message:
                'Import from "./global-test-hook" instead of "@playwright/test" to enable logging and debugging features.',
            },
          ],
        },
      ],
    },
  },
];
