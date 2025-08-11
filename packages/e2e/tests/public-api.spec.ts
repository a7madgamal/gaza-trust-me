/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { test, expect } from './global-test-hook';
import { env } from './utils/env';

test.describe('Public API Endpoints', () => {
  test('should get users for cards', async ({ request }) => {
    const response = await request.get(
      `${env.BACKEND_URL}/api/trpc/getUsersForCards?input=` +
        encodeURIComponent(
          JSON.stringify({
            limit: 10,
            offset: 0,
          })
        )
    );

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result.data)).toBe(true);
  });

  test('should get verified user count', async ({ request }) => {
    const response = await request.get(`${env.BACKEND_URL}/api/trpc/getVerifiedUserCount`);

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.result).toBeDefined();
    expect(typeof data.result.data).toBe('number');
    expect(data.result.data).toBeGreaterThanOrEqual(0);
  });

  test('should validate user schema when users exist', async ({ request }) => {
    const response = await request.get(
      `${env.BACKEND_URL}/api/trpc/getUsersForCards?input=` +
        encodeURIComponent(
          JSON.stringify({
            limit: 10,
            offset: 0,
          })
        )
    );

    expect(response.status()).toBe(200);
    const data = await response.json();

    // Always expect the response structure
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result.data)).toBe(true);

    // Require at least one user for this test
    expect(data.result.data.length).toBeGreaterThan(0);

    const user = data.result.data[0];

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

  test('should handle invalid input gracefully', async ({ request }) => {
    const response = await request.get(
      `${env.BACKEND_URL}/api/trpc/getUsersForCards?input=` +
        encodeURIComponent(
          JSON.stringify({
            limit: -1, // Invalid negative limit
            offset: 0,
          })
        )
    );

    expect(response.status()).toBe(400);
  });

  test('should handle large limit gracefully', async ({ request }) => {
    const response = await request.get(
      `${env.BACKEND_URL}/api/trpc/getUsersForCards?input=` +
        encodeURIComponent(
          JSON.stringify({
            limit: 1000, // Very large limit
            offset: 0,
          })
        )
    );

    expect(response.status()).toBe(400);
  });

  test('should return only verified help_seeker users', async ({ request }) => {
    const response = await request.get(
      `${env.BACKEND_URL}/api/trpc/getUsersForCards?input=` +
        encodeURIComponent(
          JSON.stringify({
            limit: 50,
            offset: 0,
          })
        )
    );

    expect(response.status()).toBe(200);
    const data = await response.json();

    // Always expect the response structure
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result.data)).toBe(true);

    // All returned users should be verified help_seekers
    data.result.data.forEach((user: { status: string; role: string }) => {
      expect(user.status).toBe('verified');
      expect(user.role).toBe('help_seeker');
    });
  });

  test('should order users by creation date (newest first)', async ({ request }) => {
    const response = await request.get(
      `${env.BACKEND_URL}/api/trpc/getUsersForCards?input=` +
        encodeURIComponent(
          JSON.stringify({
            limit: 10,
            offset: 0,
          })
        )
    );

    expect(response.status()).toBe(200);

    const data = await response.json();

    // Always expect the response structure
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result.data)).toBe(true);

    // Require at least one user for this test
    expect(data.result.data.length).toBeGreaterThan(0);

    // Check that users are ordered by created_at descending
    for (let i = 0; i < data.result.data.length - 1; i++) {
      const currentDate = new Date(data.result.data[i].created_at);
      const nextDate = new Date(data.result.data[i + 1].created_at);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });
});
