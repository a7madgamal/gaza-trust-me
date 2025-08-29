import { describe, it, expect } from 'vitest';
import { AuthRegistrationInputSchema, AuthLoginInputSchema, AuthLoginOutputSchema } from '../types/supabase-types';

describe('Authentication', () => {
  it('should validate registration input correctly', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
    };

    const result = AuthRegistrationInputSchema.parse(validInput);
    expect(result).toEqual(validInput);
  });

  it('should validate registration input with all optional URLs', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
      linkedinUrl: 'https://linkedin.com/in/test-user',
      campaignUrl: 'https://gofundme.com/test-campaign',
      facebookUrl: 'https://facebook.com/test-user',
      telegramUrl: 'https://t.me/testuser',
    };

    const result = AuthRegistrationInputSchema.parse(validInput);
    expect(result).toEqual(validInput);
    expect(result.linkedinUrl).toBe('https://linkedin.com/in/test-user');
    expect(result.campaignUrl).toBe('https://gofundme.com/test-campaign');
    expect(result.facebookUrl).toBe('https://facebook.com/test-user');
    expect(result.telegramUrl).toBe('https://t.me/testuser');
  });

  it('should validate registration input with only LinkedIn URL', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
      linkedinUrl: 'https://linkedin.com/in/test-user',
    };

    const result = AuthRegistrationInputSchema.parse(validInput);
    expect(result).toEqual(validInput);
    expect(result.linkedinUrl).toBe('https://linkedin.com/in/test-user');
    expect(result.campaignUrl).toBeUndefined();
  });

  it('should validate registration input with only campaign URL', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
      campaignUrl: 'https://gofundme.com/test-campaign',
    };

    const result = AuthRegistrationInputSchema.parse(validInput);
    expect(result).toEqual(validInput);
    expect(result.linkedinUrl).toBeUndefined();
    expect(result.campaignUrl).toBe('https://gofundme.com/test-campaign');
  });

  it('should reject invalid LinkedIn URL in registration', () => {
    const invalidInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
      linkedinUrl: 'not-a-valid-url',
    };

    expect(() => {
      AuthRegistrationInputSchema.parse(invalidInput);
    }).toThrow();
  });

  it('should reject invalid campaign URL in registration', () => {
    const invalidInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
      campaignUrl: 'invalid-url-format',
    };

    expect(() => {
      AuthRegistrationInputSchema.parse(invalidInput);
    }).toThrow();
  });

  it('should reject invalid Facebook URL in registration', () => {
    const invalidInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
      facebookUrl: 'not-a-valid-facebook-url',
    };

    expect(() => {
      AuthRegistrationInputSchema.parse(invalidInput);
    }).toThrow();
  });

  it('should reject invalid Telegram URL in registration', () => {
    const invalidInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
      telegramUrl: 'invalid-telegram-format',
    };

    expect(() => {
      AuthRegistrationInputSchema.parse(invalidInput);
    }).toThrow();
  });

  it('should reject invalid email in registration', () => {
    const invalidInput = {
      email: 'invalid-email',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
    };

    expect(() => {
      AuthRegistrationInputSchema.parse(invalidInput);
    }).toThrow();
  });

  it('should validate login input correctly', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = AuthLoginInputSchema.parse(validInput);
    expect(result).toEqual(validInput);
  });

  it('should reject empty password in login', () => {
    const invalidInput = {
      email: 'test@example.com',
      password: '',
    };

    expect(() => {
      AuthLoginInputSchema.parse(invalidInput);
    }).toThrow();
  });

  it('should validate login output schema with status', () => {
    const validOutput = {
      token: 'jwt-token-here',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'help_seeker',
        status: 'pending',
      },
    };

    const result = AuthLoginOutputSchema.parse(validOutput);
    expect(result).toEqual(validOutput);
  });

  it('should validate login output schema with null status', () => {
    const validOutput = {
      token: 'jwt-token-here',
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'admin',
        status: null,
      },
    };

    const result = AuthLoginOutputSchema.parse(validOutput);
    expect(result).toEqual(validOutput);
  });
});
