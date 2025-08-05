import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authRouter } from '../routers/auth';
import { supabase } from '../utils/supabase';

// Mock Supabase client
vi.mock('../utils/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      admin: {
        updateUserById: vi.fn(),
      },
    },
  },
}));

describe('Auth Router Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass LinkedIn and campaign URLs to Supabase Auth metadata', async () => {
    const mockSignUp = vi.mocked(supabase.auth.signUp);
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00.000Z',
        },
        session: null,
      },
      error: null,
    });

    const input = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
      linkedinUrl: 'https://linkedin.com/in/test-user',
      campaignUrl: 'https://gofundme.com/test-campaign',
    };

    await authRouter.createCaller({}).register(input);

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User',
          phone_number: '+1234567890',
          description: 'This is a detailed description of the help I need',
          linkedin_url: 'https://linkedin.com/in/test-user',
          campaign_url: 'https://gofundme.com/test-campaign',
        },
      },
    });
  });

  it('should handle registration with only LinkedIn URL', async () => {
    const mockSignUp = vi.mocked(supabase.auth.signUp);
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00.000Z',
        },
        session: null,
      },
      error: null,
    });

    const input = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
      linkedinUrl: 'https://linkedin.com/in/test-user',
    };

    await authRouter.createCaller({}).register(input);

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User',
          phone_number: '+1234567890',
          description: 'This is a detailed description of the help I need',
          linkedin_url: 'https://linkedin.com/in/test-user',
        },
      },
    });
  });

  it('should handle registration with only campaign URL', async () => {
    const mockSignUp = vi.mocked(supabase.auth.signUp);
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00.000Z',
        },
        session: null,
      },
      error: null,
    });

    const input = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
      campaignUrl: 'https://gofundme.com/test-campaign',
    };

    await authRouter.createCaller({}).register(input);

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User',
          phone_number: '+1234567890',
          description: 'This is a detailed description of the help I need',
          campaign_url: 'https://gofundme.com/test-campaign',
        },
      },
    });
  });

  it('should handle registration without LinkedIn or campaign URLs', async () => {
    const mockSignUp = vi.mocked(supabase.auth.signUp);
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00.000Z',
        },
        session: null,
      },
      error: null,
    });

    const input = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
    };

    await authRouter.createCaller({}).register(input);

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User',
          phone_number: '+1234567890',
          description: 'This is a detailed description of the help I need',
        },
      },
    });
  });

  it('should not include undefined LinkedIn or campaign URLs in metadata', async () => {
    const mockSignUp = vi.mocked(supabase.auth.signUp);
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: '2024-01-01T00:00:00.000Z',
        },
        session: null,
      },
      error: null,
    });

    const input = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
      linkedinUrl: undefined,
      campaignUrl: undefined,
    };

    await authRouter.createCaller({}).register(input);

    const callArgs = mockSignUp.mock.calls[0][0];
    expect(callArgs.options?.data).not.toHaveProperty('linkedin_url');
    expect(callArgs.options?.data).not.toHaveProperty('campaign_url');
  });
});
