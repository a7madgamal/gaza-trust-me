import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        require: "readonly",
        window: "readonly",
      },
    },
    rules: {
      // Disable problematic rules for now
      "no-unused-vars": "off",
      "no-undef": "off",
      "import/no-unresolved": "off",
      "import/order": "off",
      "import/no-duplicates": "off",
      "playwright/prefer-locator": "off",
      "playwright/no-wait-for-timeout": "off",
      "playwright/expect-expect": "off",
      "playwright/no-focused-test": "off",
      "playwright/no-skipped-test": "off",
      "playwright/no-force-option": "off",
      "playwright/no-element-handle": "off",
      "playwright/prefer-web-first-assertions": "off",
      "playwright/no-conditional-in-test": "off",
      "playwright/no-wait-for-selector": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/return-await": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "no-console": "off",
    },
  },
];
