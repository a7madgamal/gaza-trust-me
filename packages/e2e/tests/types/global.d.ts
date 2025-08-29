// Global type overrides for E2E tests
declare global {
  interface Window {
    openCalls: string[];
  }

  interface Navigator {
    clipboard: {
      writeText: (text: string) => Promise<string>;
      mock?: {
        calls?: Array<Array<string>>;
      };
    };
  }
}

export {};
