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
// import vibeCoder from 'eslint-plugin-vibe-coder';

// Common TypeScript rules for all packages with tsconfig - REVIEW: Fix strict rules later
const TS_RULES = {
  ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
  '@typescript-eslint/no-unsafe-assignment': 'warn', // REVIEW: Fix unsafe 'any' assignments
  '@typescript-eslint/no-unsafe-member-access': 'warn', // REVIEW: Fix unsafe member access
  '@typescript-eslint/no-unsafe-call': 'warn', // REVIEW: Fix unsafe function calls
  '@typescript-eslint/no-unsafe-return': 'warn', // REVIEW: Fix unsafe return types
  '@typescript-eslint/no-redundant-type-constituents': 'warn', // REVIEW: Remove redundant types
  '@typescript-eslint/no-floating-promises': 'warn', // REVIEW: Fix floating promises
  '@typescript-eslint/require-await': 'warn', // REVIEW: Fix async/await usage
  '@typescript-eslint/await-thenable': 'warn', // REVIEW: Fix await on non-promises
  '@typescript-eslint/no-unsafe-argument': 'warn', // REVIEW: Fix unsafe arguments
  '@typescript-eslint/no-misused-promises': 'warn', // REVIEW: Fix promise usage in event handlers
  '@typescript-eslint/unbound-method': 'warn', // REVIEW: Fix unbound methods
  '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // REVIEW: Fix unbound methods
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
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.recommended.rules,
      ...TS_RULES,
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
    },
    rules: {
      ...TS_RULES,
      ...playwright.configs.recommended.rules,
    },
  },
];
