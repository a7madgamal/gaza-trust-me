import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import vibeCoder from "eslint-plugin-vibe-coder";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "vibe-coder": vibeCoder,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "vibe-coder/no-optional-properties": "error",
      // Prevent fallbacks
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      // Custom rule to prevent || and ?? fallbacks
      "no-restricted-syntax": [
        "error",
        {
          selector: "LogicalExpression[operator='||']",
          message: "Use explicit null checks instead of || fallbacks",
        },
        {
          selector: "LogicalExpression[operator='??']",
          message: "Use explicit null checks instead of ?? fallbacks",
        },
      ],
      // Prevent nullable and optional properties
      "no-restricted-properties": [
        "error",
        {
          object: "z",
          property: "nullable",
          message: "Use required properties instead of nullable",
        },
        {
          object: "z",
          property: "optional",
          message: "Use required properties instead of optional",
        },
      ],
    },
  },
];
