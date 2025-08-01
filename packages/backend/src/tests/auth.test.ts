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
