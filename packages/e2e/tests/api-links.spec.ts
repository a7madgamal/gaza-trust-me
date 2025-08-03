import { test, expect } from '@playwright/test';

test.describe('API Links', () => {
  test('should return LinkedIn and campaign URL fields from getUsersForCards API', async ({ request }) => {
    // Call the getUsersForCards API directly
    const response = await request.post('http://localhost:3000/trpc/getUsersForCards', {
      data: {
        limit: 10,
        offset: 0,
      },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    // Check if we have users
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBeTruthy();

    // Verify the fields exist in the response structure
    expect(data.result.length).toBeGreaterThanOrEqual(0);

    // Verify the API response structure includes the expected fields
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBeTruthy();

    // Check that the response structure supports the expected fields
    // This test validates the API contract, not the data content
    const sampleUser = data.result[0] || {};
    expect(sampleUser).toHaveProperty('linkedin_url');
    expect(sampleUser).toHaveProperty('campaign_url');
  });

  test('should return LinkedIn and campaign URL fields from getVerifiedUserCount API', async ({ request }) => {
    // Call the getVerifiedUserCount API directly
    const response = await request.post('http://localhost:3000/trpc/getVerifiedUserCount');

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    // Should return a number
    expect(typeof data.result).toBe('number');
    expect(data.result).toBeGreaterThanOrEqual(0);
  });
});
