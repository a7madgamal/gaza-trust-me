# E2E Tests - Gazaconfirm Platform

End-to-end tests for the Gazaconfirm help-seeking platform using Playwright with strict TypeScript and ESLint rules.

## Features

- ✅ **Real Backend Testing** - Tests against actual backend with fake data
- ✅ **Email Verification Disabled** - No email verification complexity
- ✅ **Strict TypeScript** - No `any`, explicit types, strict mode
- ✅ **Comprehensive ESLint** - Airbnb + custom rules for testing
- ✅ **Cross-browser Testing** - Chrome, Firefox, Safari, Mobile
- ✅ **Parallel Execution** - Fast test execution
- ✅ **Visual Testing** - Screenshots and videos on failures
- ✅ **Test Data Management** - Unique test users, no conflicts

## Quick Start

### Prerequisites

1. **Backend running** on `http://localhost:3001`
2. **Frontend running** on `http://localhost:3000`
3. **Email verification disabled** (`ENABLE_EMAIL_VERIFICATION=false`)

### Install Dependencies

```bash
cd packages/e2e
npm install
```

### Install Browsers

```bash
npm run install-browsers
```

### Run Tests

```bash
# Run all tests
npm test

# Run with UI (interactive)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Run specific test file
npx playwright test auth/register.spec.ts

# Run with debug
npm run test:debug
```

### View Reports

```bash
npm run test:report
```

## Test Structure

```
tests/
├── auth/
│   ├── register.spec.ts    # User registration tests
│   └── login.spec.ts       # User login tests
├── profile/
│   └── profile.spec.ts     # Profile management tests
├── utils/
│   ├── test-data.ts        # Test data generators
│   └── auth-helpers.ts     # Authentication helpers
├── global-setup.ts         # Global test setup
└── global-teardown.ts      # Global test cleanup
```

## Test Data Strategy

Since email verification is disabled and you're using fake data:

### Unique Test Users

- Each test generates unique emails: `e2e-test-{timestamp}-{random}@test.e2e`
- No data cleanup needed - all data is fake
- Tests can modify data freely

### Predefined Test Users

```typescript
PREDEFINED_TEST_USERS = {
  helpSeeker: {
    email: 'test-user@example.com',
    password: 'password123',
    fullName: 'Test User',
    phoneNumber: '+1234567890',
  },
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    fullName: 'Admin User',
    phoneNumber: '+1234567891',
  },
};
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { generateTestUser } from '../utils/test-data';
import { registerAndLoginUser } from '../utils/auth-helpers';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    const testUser = generateTestUser();

    // Setup
    await registerAndLoginUser(page, testUser);

    // Action
    await page.click('[data-testid="some-button"]');

    // Assertion
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

### Using Test Helpers

```typescript
// Login with predefined user
await loginAsUser(page, 'helpSeeker');

// Register and login new user
const testUser = generateTestUser();
await registerAndLoginUser(page, testUser);

// Check login state
const isLoggedIn = await isUserLoggedIn(page);
```

### Data Test IDs

All tests use `data-testid` attributes for reliable element selection:

```typescript
// Good - using data-testid
await page.click('[data-testid="login-button"]');

// Bad - using text or CSS selectors
await page.click('text=Login');
await page.click('.login-btn');
```

## Configuration

### Environment Variables

```bash
# Frontend URL (default: http://localhost:3000)
FRONTEND_URL=http://localhost:3000

# Backend URL (default: http://localhost:3001)
BACKEND_URL=http://localhost:3001

# Test timeout (default: 30000ms)
TEST_TIMEOUT=30000
```

### Playwright Config

- **Parallel execution** - Tests run in parallel for speed
- **Retry on failure** - 2 retries on CI, 0 locally
- **Cross-browser** - Chrome, Firefox, Safari, Mobile
- **Visual testing** - Screenshots and videos on failures
- **Auto-start servers** - Starts backend and frontend automatically

## Best Practices

### 1. Use Test Data Generators

```typescript
// ✅ Good - Unique test data
const testUser = generateTestUser();

// ❌ Bad - Hardcoded data
const testUser = { email: 'test@example.com' };
```

### 2. Use Helper Functions

```typescript
// ✅ Good - Reusable helper
await registerAndLoginUser(page, testUser);

// ❌ Bad - Duplicated code
await page.goto('/register');
await page.fill('[data-testid="email"]', testUser.email);
// ... more duplicated code
```

### 3. Use Data Test IDs

```typescript
// ✅ Good - Reliable selectors
await page.click('[data-testid="submit-button"]');

// ❌ Bad - Fragile selectors
await page.click('text=Submit');
```

### 4. Write Descriptive Test Names

```typescript
// ✅ Good - Clear test purpose
test('should show error when email is invalid', async ({ page }) => {

// ❌ Bad - Unclear purpose
test('test email validation', async ({ page }) => {
```

### 5. Use Proper Assertions

```typescript
// ✅ Good - Specific assertions
await expect(page.locator('[data-testid="error"]')).toContainText('Invalid email');

// ❌ Bad - Generic assertions
await expect(page.locator('[data-testid="error"]')).toBeVisible();
```

## Troubleshooting

### Common Issues

1. **Tests failing with "element not found"**
   - Check if `data-testid` attributes are added to frontend components
   - Verify element is visible and not hidden

2. **Backend not responding**
   - Ensure backend is running on port 3001
   - Check `ENABLE_EMAIL_VERIFICATION=false` in backend env

3. **Frontend not loading**
   - Ensure frontend is running on port 3000
   - Check for console errors

4. **Slow test execution**
   - Tests run in parallel by default
   - Use `--workers=1` for debugging

### Debug Mode

```bash
# Run with debug mode
npm run test:debug

# This will:
# - Run tests in headed mode
# - Pause on failures
# - Show browser console
# - Allow manual interaction
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: cd packages/backend && npm ci
      - run: cd packages/frontend && npm ci
      - run: cd packages/e2e && npm ci
      - run: cd packages/e2e && npm run install-browsers
      - run: cd packages/e2e && npm test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: packages/e2e/playwright-report/
```

## Contributing

1. **Add data-testid attributes** to new frontend components
2. **Write tests** for new features
3. **Use helper functions** for common operations
4. **Follow naming conventions** for test files and functions
5. **Run linting** before committing: `npm run lint`
6. **Run type checking**: `npm run type-check`

## Future Enhancements

- [ ] **API Testing** - Test backend endpoints directly
- [ ] **Performance Testing** - Load testing for critical flows
- [ ] **Accessibility Testing** - WCAG compliance checks
- [ ] **Visual Regression Testing** - Screenshot comparisons
- [ ] **Mobile Testing** - Device-specific test scenarios
