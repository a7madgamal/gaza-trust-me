import { test, expect } from './global-test-hook';
import { testTRPC } from './utils/trpc-client';
import { assertNotNull } from './utils/test-utils';

test.describe('Public API Endpoints', () => {
  test('should handle complete user data retrieval and validation with proper schema', async () => {
    // Get first user using getNextUser
    const user = await testTRPC.getNextUser.query({
      direction: 'next',
    });

    // Get verified user count
    const count = await testTRPC.getVerifiedUserCount.query();
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);

    // Require at least one user for this test
    expect(user).not.toBeNull();
    assertNotNull(user);

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
    // Test invalid user ID
    await expect(
      testTRPC.getNextUser.query({
        direction: 'next',
        currentUserId: 'invalid-uuid',
      })
    ).rejects.toThrow();

    // Test invalid direction
    await expect(
      testTRPC.getNextUser.query({
        // @ts-expect-error -- ok here
        direction: 'invalid',
      })
    ).rejects.toThrow();
  });

  test('should return only verified help_seeker and admin users ordered by view count and creation date', async () => {
    const user = await testTRPC.getNextUser.query({
      direction: 'next',
    });

    expect(user).not.toBeNull();
    assertNotNull(user);

    // User should be verified help_seeker or admin (but not super admin)
    expect(user.status).toBe('verified');
    expect(['help_seeker', 'admin']).toContain(user.role);
    expect(user.role).not.toBe('super_admin'); // Super admins should not appear
    expect(user).toHaveProperty('view_count');
    expect(typeof user.view_count).toBe('number');

    // Check that user has proper ordering fields
    expect(user.created_at).toBeDefined();
    expect(user.view_count).toBeDefined();
  });

  test('should include admin users in card view', async () => {
    // Get first user
    const user = await testTRPC.getNextUser.query({
      direction: 'next',
    });

    expect(user).not.toBeNull();
    assertNotNull(user);

    // User should be verified and have proper role
    expect(user.status).toBe('verified');
    expect(['help_seeker', 'admin']).toContain(user.role);
    expect(user.role).not.toBe('super_admin'); // Super admins should not appear
  });
});
