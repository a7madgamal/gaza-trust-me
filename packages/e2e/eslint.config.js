import js from '@eslint/js';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import playwrightPlugin from 'eslint-plugin-playwright';

export default [
  js.configs.recommended,
  playwrightPlugin.configs['flat/recommended'],
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        window: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      // Focus on Playwright rules for test quality
      'playwright/no-skipped-test': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/expect-expect': 'error',
      'playwright/no-wait-for-timeout': 'warn',
      'playwright/no-wait-for-selector': 'off',
      'playwright/no-networkidle': 'warn',
      'playwright/no-conditional-in-test': 'warn',
      'playwright/no-conditional-expect': 'error',
      'playwright/prefer-web-first-assertions': 'warn',
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': 'error',
      // Disable other rules for now to focus on test quality
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-console': 'off',
    },
  },
];
