import { test, expect } from './global-test-hook';
import { testTRPC } from './utils/trpc-client';
import { assertNotEmptyString, assertNotNull, assertNotUndefined } from './utils/test-utils';

test.describe('Public API Endpoints', () => {
  test('should handle complete user data retrieval and validation with proper schema', async () => {
    const users = await testTRPC.getUsersForCards.query({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(users)).toBe(true);

    // Get verified user count
    const count = await testTRPC.getVerifiedUserCount.query();
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);

    // Require at least one user for this test
    expect(users.length).toBeGreaterThan(0);

    const user = users[0];
    assertNotUndefined(user);

    // Check required fields
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('full_name');
    expect(user).toHaveProperty('description');
    expect(user).toHaveProperty('phone_number');
    expect(user).toHaveProperty('status');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('created_at');

    // Check field types
    expect(typeof user.id).toBe('string');
    expect(typeof user.full_name).toBe('string');
    expect(typeof user.description).toBe('string');
    expect(typeof user.phone_number).toBe('string');
    expect(['pending', 'verified', 'flagged']).toContain(user.status);
    expect(['help_seeker', 'admin', 'super_admin']).toContain(user.role);
    expect(typeof user.created_at).toBe('string');
  });

  test('should handle error cases and input validation gracefully', async () => {
    // Test invalid negative limit
    await expect(
      testTRPC.getUsersForCards.query({
        limit: -1,
        offset: 0,
      })
    ).rejects.toThrow();

    // Test very large limit
    await expect(
      testTRPC.getUsersForCards.query({
        limit: 1000,
        offset: 0,
      })
    ).rejects.toThrow();
  });

  test('should return only verified help_seeker users ordered by creation date', async () => {
    const users = await testTRPC.getUsersForCards.query({
      limit: 50,
      offset: 0,
    });

    expect(Array.isArray(users)).toBe(true);

    // All returned users should be verified help_seekers
    users.forEach(user => {
      expect(user.status).toBe('verified');
      expect(user.role).toBe('help_seeker');
    });

    // Require at least one user for ordering test
    expect(users.length).toBeGreaterThan(0);

    // Check that users are ordered by created_at descending
    for (let i = 0; i < users.length - 1; i++) {
      const currentUser = users[i];
      const nextUser = users[i + 1];

      assertNotUndefined(currentUser);
      assertNotUndefined(nextUser);

      expect(currentUser.created_at).toBeDefined();
      expect(nextUser.created_at).toBeDefined();

      const { created_at: currentCreatedAt } = currentUser;
      const { created_at: nextCreatedAt } = nextUser;
      assertNotNull(currentCreatedAt);
      assertNotNull(nextCreatedAt);

      const currentDate = new Date(currentCreatedAt);
      const nextDate = new Date(nextCreatedAt);

      assertNotUndefined(currentDate);
      assertNotUndefined(nextDate);
      assertNotNull(currentDate);
      assertNotNull(nextDate);
      assertNotEmptyString(currentDate);
      assertNotEmptyString(nextDate);

      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });
});
