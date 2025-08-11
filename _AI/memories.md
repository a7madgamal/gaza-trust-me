# AI Assistant Memories

## User Preferences and Rules

- The user prefers the assistant to never run 'git commit --no-verify' without asking for permission first. (ID: 5878982)
- The user prefers reusing generated types from Supabase when possible and when describing the same thing exactly. (ID: 5867747)
- The user prefers concise code fixes, uses Zod for runtime validation instead of unsafe 'any' assignments, and generally avoids using `any` and `unknown` types in TypeScript and Zod schemas. (ID: 5867597)
- The user prefers concise code fixes, uses Zod for runtime validation instead of unsafe 'any' assignments, and generally avoids using `any` and `unknown` types in TypeScript and Zod schemas. (ID: 5796170)
- When using tRPC in this project, use t.createCallerFactory(router) instead of createCaller. (ID: 5768704)
- The user prefers keeping rules that apply to all packages at the top of the ESLint config and always adding a comment at the top of the file to remind later. (ID: 5719248)
- **NEVER report misleading success or hide issues away. Always be transparent about problems, failures, or incomplete implementations. If something is broken, say it's broken. If tests are failing, acknowledge the failures. If features are partially implemented, clearly state what's missing. Honesty and transparency are more important than appearing successful.** (ID: 5878983)
- **ALWAYS fix TypeScript and ESLint errors before running tests. Check for type errors, linting issues, and code quality problems first. Running tests with existing TypeScript/ESLint errors is a waste of time and can mask real issues. Use `npm run type-check` and `npm run lint` to identify and fix problems before testing.** (ID: 5878984)
- **ALWAYS regenerate types after backend tRPC changes. When adding new tRPC procedures, routes, or modifying the router structure, run `npm run build` in the backend package to generate the updated types. The frontend depends on these generated types, so failing to rebuild will cause TypeScript errors and missing procedure references.** (ID: 5878985)
- **NEVER "fix" ESLint by ignoring rules without confirming. Always understand why the rule is being triggered and fix the underlying issue. Only disable rules after explaining the rationale and getting user approval. ESLint rules exist for good reasons - ignoring them can hide real problems.** (ID: 5878986)
