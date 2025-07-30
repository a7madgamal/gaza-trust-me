import { describe, it, expect } from 'vitest';
import { UserRegistrationSchema, UserLoginSchema } from '../schemas/user';

describe('Authentication', () => {
  it('should validate registration input correctly', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
    };

    const result = UserRegistrationSchema.parse(validInput);
    expect(result).toEqual(validInput);
  });

  it('should reject invalid email in registration', () => {
    const invalidInput = {
      email: 'invalid-email',
      password: 'password123',
      fullName: 'Test User',
    };

    expect(() => {
      UserRegistrationSchema.parse(invalidInput);
    }).toThrow();
  });

  it('should validate login input correctly', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = UserLoginSchema.parse(validInput);
    expect(result).toEqual(validInput);
  });

  it('should reject empty password in login', () => {
    const invalidInput = {
      email: 'test@example.com',
      password: '',
    };

    expect(() => {
      UserLoginSchema.parse(invalidInput);
    }).toThrow();
  });
});
