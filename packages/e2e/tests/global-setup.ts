import { chromium, FullConfig } from './global-test-hook';
import { rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { DebugEvent } from './utils/debug-types';

// Global storage for captured data
declare global {
  var __testDebugData: Map<string, DebugEvent[]>;
}

/**
 * Global setup for E2E tests
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig): Promise<void> {
  const { baseURL } = config.projects[0]?.use ?? {};

  if (!baseURL) {
    throw new Error('Base URL not configured');
  }

  // Clear debug-data folder before tests
  const debugDataDir = join(process.cwd(), 'test-results', 'debug-data');
  if (existsSync(debugDataDir)) {
    rmSync(debugDataDir, { recursive: true, force: true });
    console.log('🧹 GLOBAL SETUP: Cleared debug-data folder');
  }

  // Initialize global storage for debug data
  global.__testDebugData = new Map();
  console.log('🔍 GLOBAL SETUP: Initialized global.__testDebugData');

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
    await page.waitForLoadState('domcontentloaded');

    console.log('✅ Global setup completed - services are running');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
