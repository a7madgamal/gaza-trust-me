import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    cache: {
      dir: 'node_modules/.vitest',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      exclude: ['node_modules/', 'dist/', '**/*.d.ts', '**/*.config.*', '**/coverage/**'],
    },
  },
});
