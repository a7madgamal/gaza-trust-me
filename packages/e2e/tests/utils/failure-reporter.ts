// eslint-disable-next-line no-restricted-imports
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { generateTestFileName } from './test-id';
import type { DebugEvent } from './debug-types';

class FailureReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      this.printFailureDetails(test, result);
    }
  }

  private getTestTitle(test: TestCase): string {
    return test.title;
  }

  private printFailureDetails(test: TestCase, result: TestResult) {
    const testTitle = this.getTestTitle(test);

    // Get debug data from file storage
    const debugFile = join(process.cwd(), 'test-results', 'debug-data', generateTestFileName(testTitle));

    console.log(`🔍 DEBUG: Looking for file: ${debugFile}`);
    console.log(`🔍 DEBUG: File exists: ${existsSync(debugFile).toString()}`);

    let debugEvents: DebugEvent[] = [];

    if (existsSync(debugFile)) {
      const fileContent = readFileSync(debugFile, 'utf8');
      console.log(`🔍 DEBUG: Found debug file with ${fileContent.length} characters`);

      // Parse the plain text content
      try {
        debugEvents = this.parseDebugText(fileContent);
        console.log(`🔍 DEBUG: Found ${debugEvents.length} debug events`);
      } catch (error) {
        console.log(`🔍 DEBUG: Failed to parse debug text: ${String(error)}`);
        debugEvents = [];
      }
    } else {
      console.log(`🔍 DEBUG: File not found!`);
    }

    console.log('\n' + '='.repeat(80));
    console.log(`🔴 TEST FAILED: ${testTitle}`);
    console.log('='.repeat(80));

    // Print error details
    if (result.error) {
      console.log('\n📋 ERROR DETAILS:');
      console.log(`   Message: ${result.error.message}`);
      console.log(`   Stack: ${result.error.stack}`);
    }

    // Print debug events chronologically
    if (debugEvents.length > 0) {
      console.log('\n🕐 CHRONOLOGICAL DEBUG EVENTS:');
      debugEvents.forEach((event, index) => {
        const timestamp = new Date(event.timestamp).toISOString();

        switch (event.type) {
          case 'console':
            const consoleData = event.data;
            const icon = this.getConsoleIcon(consoleData.type);
            console.log(`   ${index + 1}. ${timestamp} ${icon} [CONSOLE] ${consoleData.text}`);
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
            console.log(
              `   ${index + 1}. ${timestamp} 🌐 [NETWORK] ${networkData.method} ${finalStatus} ${networkData.url}`
            );

            if (networkData.headers['authorization']) {
              console.log(`      🔐 Authorization: Bearer ***`);
            }
            if (networkData.headers['content-type']) {
              console.log(`      📄 Content-Type: ${networkData.headers['content-type']}`);
            }
            if (networkData.postData) {
              console.log(
                `      📝 Request Body: ${networkData.postData.substring(0, 100)}${networkData.postData.length > 100 ? '...' : ''}`
              );
            }
            if (networkData.responseBody) {
              console.log(
                `      📤 Response Body: ${networkData.responseBody.substring(0, 200)}${networkData.responseBody.length > 200 ? '...' : ''}`
              );
            }
            break;

          case 'navigation':
            const navData = event.data;
            const navIcon = navData.type === 'redirect' ? '🔄' : navData.type === 'load' ? '📄' : '🧭';
            console.log(
              `   ${index + 1}. ${timestamp} ${navIcon} [NAVIGATION] ${navData.type.toUpperCase()} to ${navData.url}`
            );
            break;
        }
      });
    } else {
      console.log('\n🕐 CHRONOLOGICAL DEBUG EVENTS: No debug events captured');
    }

    console.log('='.repeat(80));
    console.log(`📁 Test file: ${test.location?.file || 'Unknown'}`);
    console.log(`📄 Debug logs: ${debugFile}`);
    console.log('='.repeat(80) + '\n');
  }

  private getConsoleIcon(type: string): string {
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

  private parseDebugText(content: string): DebugEvent[] {
    const events: DebugEvent[] = [];

    const lines = content.split('\n');

    for (const line of lines) {
      if (line.includes('=== CHRONOLOGICAL DEBUG EVENTS ===') || line.includes('No debug events captured')) {
        continue;
      }

      // Parse event line: "1. 2025-08-11T17:51:06.253Z ❌ [CONSOLE] Failed to load resource..."
      const eventMatch = line.match(/^(\d+)\. (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z) (.+) \[(\w+)\] (.+)$/);
      if (eventMatch && eventMatch[2] && eventMatch[4] && eventMatch[5]) {
        const timestamp = new Date(eventMatch[2]).getTime();
        const eventTypeRaw = eventMatch[4].toLowerCase();
        const eventType =
          eventTypeRaw === 'console' || eventTypeRaw === 'network' || eventTypeRaw === 'navigation'
            ? eventTypeRaw
            : 'console';
        const eventData = eventMatch[5];

        switch (eventType) {
          case 'console':
            // Parse console event: "❌ [CONSOLE] Failed to load resource..."
            const consoleMatch = eventData.match(/^(.+) (.+)$/);
            if (consoleMatch && consoleMatch[1] && consoleMatch[2]) {
              events.push({
                timestamp,
                type: 'console',
                data: {
                  type: this.getConsoleTypeFromIcon(consoleMatch[1]),
                  text: consoleMatch[2],
                },
              });
            }
            break;

          case 'network':
            // Parse network event: "🌐 [NETWORK] GET ✅ 200 http://localhost:3000/api/trpc/getProfile"
            const networkMatch = eventData.match(/^(.+) (.+) (.+) (.+)$/);
            if (networkMatch && networkMatch[2] && networkMatch[3] && networkMatch[4]) {
              const status =
                networkMatch[3] === '⏳'
                  ? undefined
                  : networkMatch[3].includes('❌')
                    ? parseInt(networkMatch[3].replace('❌ ', ''))
                    : networkMatch[3].includes('🔄')
                      ? parseInt(networkMatch[3].replace('🔄 ', ''))
                      : networkMatch[3].includes('✅')
                        ? parseInt(networkMatch[3].replace('✅ ', ''))
                        : undefined;

              events.push({
                timestamp,
                type: 'network',
                data: {
                  method: networkMatch[2],
                  ...(status !== undefined && { status }),
                  url: networkMatch[4],
                  headers: {},
                },
              });
            }
            break;

          case 'navigation':
            // Parse navigation event: "🔄 [NAVIGATION] REDIRECT to /dashboard"
            const navMatch = eventData.match(/^(.+) (.+) to (.+)$/);
            if (navMatch && navMatch[2] && navMatch[3]) {
              events.push({
                timestamp,
                type: 'navigation',
                data: {
                  type: (() => {
                    const navType = navMatch[2].toLowerCase();
                    return navType === 'navigate' || navType === 'redirect' || navType === 'load'
                      ? navType
                      : 'navigate';
                  })(),
                  url: navMatch[3],
                },
              });
            }
            break;
        }
      }

      // Parse additional network details (headers, body, etc.)
      if (line.includes('🔐 Authorization:') || line.includes('📄 Content-Type:') || line.includes('📝 Body:')) {
        const lastNetworkEvent = events.filter(e => e.type === 'network').pop();
        if (lastNetworkEvent && lastNetworkEvent.type === 'network') {
          if (line.includes('🔐 Authorization:')) {
            lastNetworkEvent.data.headers['authorization'] = 'Bearer ***';
          } else if (line.includes('📄 Content-Type:')) {
            const contentTypeMatch = line.match(/📄 Content-Type: (.+)$/);
            if (contentTypeMatch && contentTypeMatch[1]) {
              lastNetworkEvent.data.headers['content-type'] = contentTypeMatch[1];
            }
          } else if (line.includes('📝 Body:')) {
            const bodyMatch = line.match(/📝 Body: (.+)$/);
            if (bodyMatch && bodyMatch[1]) {
              lastNetworkEvent.data.postData = bodyMatch[1];
            }
          }
        }
      }
    }

    return events;
  }

  private getConsoleTypeFromIcon(icon: string): 'error' | 'warning' | 'info' | 'log' {
    switch (icon) {
      case '❌':
        return 'error';
      case '⚠️':
        return 'warning';
      case 'ℹ️':
        return 'info';
      default:
        return 'log';
    }
  }
}

export default FailureReporter;
