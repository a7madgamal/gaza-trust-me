import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for E2E tests
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig): Promise<void> {
  const { baseURL } = config.projects[0]?.use ?? {};

  if (!baseURL) {
    throw new Error('Base URL not configured');
  }

  // Start browser to verify services are running
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Test backend health
    const backendResponse = await page.request.get(`${baseURL.replace('3000', '3001')}/health`);
    if (!backendResponse.ok()) {
      throw new Error(`Backend not healthy: ${backendResponse.status()}`);
    }

    // Test frontend
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    console.log('✅ Global setup completed - services are running');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
