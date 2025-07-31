import { FullConfig } from '@playwright/test';

/**
 * Global teardown for E2E tests
 * This runs once after all tests complete
 */
async function globalTeardown(_config: FullConfig): Promise<void> {
  console.log('Global teardown completed');
}

export default globalTeardown;
