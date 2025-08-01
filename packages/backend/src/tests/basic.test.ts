import { describe, it, expect } from 'vitest';
import { validateInput, safeValidateInput } from '../utils/validation';
import { AuthRegistrationInputSchema } from '../types/supabase-types';

describe('Backend Setup', () => {
  it('should validate user registration input correctly', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
    };

    const result = validateInput(AuthRegistrationInputSchema, validInput);
    expect(result).toEqual(validInput);
  });

  it('should reject invalid email in user registration', () => {
    const invalidInput = {
      email: 'invalid-email',
      password: 'password123',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
    };

    expect(() => validateInput(AuthRegistrationInputSchema, invalidInput)).toThrow();
  });

  it('should safely validate input and return null for invalid data', () => {
    const invalidInput = {
      email: 'invalid-email',
      password: 'short',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
    };

    const result = safeValidateInput(AuthRegistrationInputSchema, invalidInput);
    expect(result).toBeNull();
  });

  it('should reject registration without phone number', () => {
    const inputWithoutPhone = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
      description: 'This is a detailed description of the help I need',
    };

    expect(() => validateInput(AuthRegistrationInputSchema, inputWithoutPhone)).toThrow();
  });

  it('should reject registration without description', () => {
    const inputWithoutDescription = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
    };

    expect(() => validateInput(AuthRegistrationInputSchema, inputWithoutDescription)).toThrow();
  });

  it('should reject description that is too short', () => {
    const inputWithShortDescription = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      description: 'Too short',
    };

    expect(() => validateInput(AuthRegistrationInputSchema, inputWithShortDescription)).toThrow();
  });

  it('should reject description that is too long', () => {
    const longDescription = 'a'.repeat(2001);
    const inputWithLongDescription = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      description: longDescription,
    };

    expect(() => validateInput(AuthRegistrationInputSchema, inputWithLongDescription)).toThrow();
  });

  it('should accept description at minimum length', () => {
    const minDescription = 'a'.repeat(10);
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      description: minDescription,
    };

    const result = validateInput(AuthRegistrationInputSchema, validInput);
    expect(result.description).toBe(minDescription);
  });

  it('should accept description at maximum length', () => {
    const maxDescription = 'a'.repeat(2000);
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      description: maxDescription,
    };

    const result = validateInput(AuthRegistrationInputSchema, validInput);
    expect(result.description).toBe(maxDescription);
  });
});
