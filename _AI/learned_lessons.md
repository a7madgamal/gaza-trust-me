# Learned Lessons & Development Mistakes

**Purpose:** Track lessons learned and mistakes made during development to improve AI agent performance and avoid repeating errors. Keep entries concise and AI agent-friendly.
**Note:** Always ask which lessons to include before editing and keep it very consice and sarcastic.

---

## Development Workflow

### ❌ **PowerShell Command Syntax**

- **Problem:** Used `&&` operator in PowerShell (not supported)
- **Correct:** Use separate commands or `;` separator
- **Lesson:** Always use Windows-compatible commands

### ❌ **Type Assertions & User Preferences**

- **Problem:** Used `as` and `any` when user prefers Zod
- **User Preference:** "i prefer zod when suitable instead"
- **Lesson:** Use Zod for runtime validation, avoid `as` and `any`

### ✅ **Incremental Refactoring**

- **Approach:** Broke down large refactoring into smaller, testable steps
- **Lesson:** Incremental changes reduce risk and improve debugging

### ❌ **Unnecessary Comments**

- **Problem:** Added verbose comments that don't add real value
- **User Preference:** "avoid comments unless really needed and adding real value"
- **Lesson:** Only comment non-obvious logic, let code speak for itself
