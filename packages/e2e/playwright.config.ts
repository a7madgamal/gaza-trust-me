import { defineConfig, devices } from '@playwright/test';
import { env } from './tests/utils/env';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!env.CI,
  /* Retry on CI only */
  retries: env.CI ? 2 : 0,
  /* Use single worker to avoid race conditions and shared state issues */
  workers: 1,
  /* Stop on first failure */
  // maxFailures: 1,
  /* Cache test results */
  outputDir: 'test-results',
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: env.FRONTEND_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Global test timeout */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          headless: false,
        },
      },
    },
  ],

  // /* Run your local dev server before starting the tests */
  // webServer: [
  //   {
  //     command: 'cd ../frontend && npm run dev',
  //     url: 'http://localhost:3000',
  //     reuseExistingServer: !process.env['CI'],
  //     timeout: 120 * 1000,
  //   },
  //   {
  //     command: 'cd ../backend && npm run dev',
  //     url: 'http://localhost:3001/health',
  //     reuseExistingServer: !process.env['CI'],
  //     timeout: 120 * 1000,
  //   },
  // ],

  /* Global setup and teardown */
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
});
