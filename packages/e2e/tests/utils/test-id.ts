// Shared utility for generating consistent test IDs
export function generateTestFileName(testTitle: string): string {
  return `${testTitle.replace(/[^a-zA-Z0-9]/g, '_')}.log`;
}
