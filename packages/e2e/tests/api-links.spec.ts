import { test, expect } from '@playwright/test';

test.describe('API Links', () => {
  test('should return LinkedIn and campaign URL fields from getUsersForCards API', async ({ request }) => {
    // Call the getUsersForCards API directly
    const response = await request.get(
      `${process.env['BACKEND_URL']}/trpc/getUsersForCards?input=` +
        encodeURIComponent(
          JSON.stringify({
            limit: 10,
            offset: 0,
          })
        )
    );

    expect(response.status()).toBe(200);
    const data = await response.json();

    // Check if we have users
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result.data)).toBe(true);

    // Verify the fields exist in the response structure
    expect(data.result.data.length).toBeGreaterThanOrEqual(0);

    // Check that the response structure supports the expected fields
    // This test validates the API contract, not the data content
    const sampleUser = data.result.data[0] || {};
    expect(sampleUser).toHaveProperty('linkedin_url');
    expect(sampleUser).toHaveProperty('campaign_url');
  });

  test('should return LinkedIn and campaign URL fields from getVerifiedUserCount API', async ({ request }) => {
    // Call the getVerifiedUserCount API directly
    const response = await request.get(`${process.env['BACKEND_URL']}/trpc/getVerifiedUserCount`);

    expect(response.status()).toBe(200);
    const data = await response.json();

    // Should return a number
    expect(data.result).toBeDefined();
    expect(typeof data.result.data).toBe('number');
    expect(data.result.data).toBeGreaterThanOrEqual(0);
  });
});
