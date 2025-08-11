import { test, expect } from './global-test-hook';
import { testTRPC } from './utils/trpc-client';

test.describe('Public API Endpoints', () => {
  test('should get users for cards', async () => {
    const users = await testTRPC.getUsersForCards.query({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(users)).toBe(true);
  });

  test('should get verified user count', async () => {
    const count = await testTRPC.getVerifiedUserCount.query();

    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should validate user schema when users exist', async () => {
    const users = await testTRPC.getUsersForCards.query({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(users)).toBe(true);

    // Require at least one user for this test
    expect(users.length).toBeGreaterThan(0);

    const user = users[0]!; // Assert user exists since we checked length > 0
    expect(user).toBeDefined();

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

  test('should handle invalid input gracefully', async () => {
    await expect(
      testTRPC.getUsersForCards.query({
        limit: -1, // Invalid negative limit
        offset: 0,
      })
    ).rejects.toThrow();
  });

  test('should handle large limit gracefully', async () => {
    await expect(
      testTRPC.getUsersForCards.query({
        limit: 1000, // Very large limit
        offset: 0,
      })
    ).rejects.toThrow();
  });

  test('should return only verified help_seeker users', async () => {
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
  });

  test('should order users by creation date (newest first)', async () => {
    const users = await testTRPC.getUsersForCards.query({
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(users)).toBe(true);

    // Require at least one user for this test
    expect(users.length).toBeGreaterThan(0);

    // Check that users are ordered by created_at descending
    for (let i = 0; i < users.length - 1; i++) {
      const currentUser = users[i]!; // Assert user exists since we're in bounds
      const nextUser = users[i + 1]!; // Assert user exists since we're in bounds

      expect(currentUser.created_at).toBeDefined();
      expect(nextUser.created_at).toBeDefined();

      const currentDate = new Date(currentUser.created_at!);
      const nextDate = new Date(nextUser.created_at!);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });
});
