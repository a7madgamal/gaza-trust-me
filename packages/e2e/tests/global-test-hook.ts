/* eslint-disable no-restricted-imports */
import { test as base } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { generateTestFileName } from './utils/test-id';
import type { DebugEvent } from './utils/debug-types';

interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  headers?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  postData?: string;
  responseBody?: string;
  timing?: number;
}

function isValidConsoleType(type: string): type is 'error' | 'warning' | 'info' | 'log' {
  return ['error', 'warning', 'info', 'log'].includes(type);
}

// Helper function to format debug data as plain text chronologically
function formatDebugDataAsText(debugEvents: DebugEvent[]): string {
  // Sort all events chronologically
  const sortedEvents = [...debugEvents].sort((a, b) => a.timestamp - b.timestamp);

  let text = '=== CHRONOLOGICAL DEBUG EVENTS ===\n';

  if (sortedEvents.length === 0) {
    text += 'No debug events captured\n';
  } else {
    sortedEvents.forEach((event, index) => {
      const timestamp = new Date(event.timestamp).toISOString();

      switch (event.type) {
        case 'console':
          const consoleData = event.data;
          const icon = getConsoleIcon(consoleData.type);
          text += `${index + 1}. ${timestamp} ${icon} [CONSOLE] ${consoleData.text}\n`;
          break;

        case 'network':
          const networkData = event.data;
          const status = networkData.status ? `${networkData.status}` : 'pending';
          const statusIcon =
            networkData.status && networkData.status >= 400
              ? '❌'
              : networkData.status && networkData.status >= 300
                ? '🔄'
                : '✅';
          const finalStatus = networkData.status ? `${statusIcon} ${status}` : '⏳';
          text += `${index + 1}. ${timestamp} 🌐 [NETWORK] ${networkData.method} ${finalStatus} ${networkData.url}\n`;

          if (networkData.headers['authorization']) {
            text += `   🔐 Authorization: Bearer ***\n`;
          }
          if (networkData.headers['content-type']) {
            text += `   📄 Content-Type: ${networkData.headers['content-type']}\n`;
          }
          if (networkData.postData) {
            text += `   📝 Request Body: ${networkData.postData.substring(0, 100)}${networkData.postData.length > 100 ? '...' : ''}\n`;
          }
          if (networkData.responseBody) {
            text += `   📤 Response Body: ${networkData.responseBody.substring(0, 200)}${networkData.responseBody.length > 200 ? '...' : ''}\n`;
          }
          break;

        case 'navigation':
          const navData = event.data;
          const navIcon = navData.type === 'redirect' ? '🔄' : navData.type === 'load' ? '📄' : '🧭';
          text += `${index + 1}. ${timestamp} ${navIcon} [NAVIGATION] ${navData.type.toUpperCase()} to ${navData.url}\n`;
          break;
      }
    });
  }

  return text;
}

function getConsoleIcon(type: string): string {
  switch (type) {
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '📝';
  }
}

// Extend the base test with automatic debug capture
export const test = base.extend({
  // Override the page fixture to add automatic capture
  page: async ({ page }, use, testInfo) => {
    const testTitle = testInfo.title;
    const debugEvents: DebugEvent[] = [];
    const pendingRequests = new Map<string, NetworkRequest>();

    // Capture console messages (only errors and important warnings)
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();

      // Only capture errors and important warnings, skip React dev tools and router warnings
      if (
        type === 'error' ||
        (type === 'warning' && !text.includes('React Router') && !text.includes('React DevTools'))
      ) {
        console.log(`🔍 CAPTURED CONSOLE: ${type} - ${text}`);
        if (isValidConsoleType(type)) {
          const event: DebugEvent = {
            type: 'console',
            timestamp: Date.now(),
            data: {
              type,
              text: text,
            },
          };
          debugEvents.push(event);

          // Write to file immediately for the reporter
          writeDebugFile(testTitle, debugEvents);
        }
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      const event: DebugEvent = {
        type: 'console',
        timestamp: Date.now(),
        data: {
          type: 'error',
          text: `Page Error: ${error.message}`,
        },
      };
      debugEvents.push(event);
      writeDebugFile(testTitle, debugEvents);
    });

    // Capture navigation events
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        const url = frame.url();
        console.log(`🔍 CAPTURED NAVIGATION: ${url}`);
        const event: DebugEvent = {
          type: 'navigation',
          timestamp: Date.now(),
          data: {
            type: 'navigate',
            url: url,
          },
        };
        debugEvents.push(event);
        writeDebugFile(testTitle, debugEvents);
      }
    });

    // Capture redirects by monitoring URL changes
    let currentUrl = '';
    page.on('load', () => {
      const url = page.url();
      if (currentUrl && currentUrl !== url) {
        console.log(`🔍 CAPTURED REDIRECT: ${currentUrl} -> ${url}`);
        const event: DebugEvent = {
          type: 'navigation',
          timestamp: Date.now(),
          data: {
            type: 'redirect',
            url: url,
          },
        };
        debugEvents.push(event);
        writeDebugFile(testTitle, debugEvents);
      }
      currentUrl = url;
    });

    // Capture network requests (only API calls)
    page.on('request', request => {
      const url = request.url();
      // Only capture API calls, not internal dev server calls
      if (url.includes('/api/') || url.includes('supabase.co') || url.includes('localhost:3001')) {
        const postData = request.postData();
        console.log(`🔍 CAPTURED API REQUEST: ${request.method()} ${url}`);
        const networkRequest: NetworkRequest = {
          url: url,
          method: request.method(),
          headers: request.headers(),
          ...(postData && { postData }),
          timing: Date.now(),
        };
        // Store request for later completion
        pendingRequests.set(url, networkRequest);
      }
    });

    // Capture network responses (only for API calls)
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/') || url.includes('supabase.co') || url.includes('localhost:3001')) {
        const pendingRequest = pendingRequests.get(url);
        if (pendingRequest) {
          // Try to get response body (for JSON responses)
          let responseBody: string | undefined;
          try {
            const contentType = response.headers()['content-type'] || '';
            if (contentType.includes('application/json')) {
              responseBody = await response.text();
            }
          } catch (error) {
            // Response body might not be available
            console.log(`🔍 Could not read response body for ${url}: ${String(error)}`);
          }

          const event: DebugEvent = {
            type: 'network',
            timestamp: Date.now(),
            data: {
              method: pendingRequest.method,
              status: response.status(),
              url: pendingRequest.url,
              headers: pendingRequest.headers || {},
              ...(pendingRequest.postData && { postData: pendingRequest.postData }),
              ...(responseBody && { responseBody }),
            },
          };
          debugEvents.push(event);
          pendingRequests.delete(url);

          // Write to file immediately for the reporter
          writeDebugFile(testTitle, debugEvents);
        }
      }
    });

    await use(page);

    // Store debug data in global storage for the reporter to access
    if (!global.__testDebugData) {
      global.__testDebugData = new Map();
    }
    global.__testDebugData.set(testTitle, debugEvents);
  },
});

// Helper function to write debug file
function writeDebugFile(testTitle: string, debugEvents: DebugEvent[]) {
  const debugDir = join(process.cwd(), 'test-results', 'debug-data');
  if (!existsSync(debugDir)) {
    mkdirSync(debugDir, { recursive: true });
  }
  const debugFile = join(debugDir, generateTestFileName(testTitle));
  const textContent = formatDebugDataAsText(debugEvents);
  writeFileSync(debugFile, textContent);
}

// Add afterEach hook to keep browser open on test failures
test.afterEach(async (_, testInfo) => {
  // Check if test failed and we're not in CI
  if (testInfo.status !== 'passed' && !process.env['CI']) {
    console.log(`\n🔍 Test "${testInfo.title}" failed. Keeping browser open for debugging...`);
    console.log('   Press Ctrl+C to close the browser and continue.');

    // Disable timeout and keep the browser open
    testInfo.setTimeout(0);

    // Create an unresolved promise to hold execution
    await new Promise(() => {
      // This promise never resolves, keeping the browser open
    });
  }
});

export { expect, chromium } from '@playwright/test';
export type { Page, Browser, BrowserContext, Locator, FullConfig } from '@playwright/test';
