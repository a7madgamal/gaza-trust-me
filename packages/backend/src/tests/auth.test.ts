import { describe, it, expect } from 'vitest';
import { AuthRegistrationInputSchema, AuthLoginInputSchema } from '../types/supabase-types';

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
});
