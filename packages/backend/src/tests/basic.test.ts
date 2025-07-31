import { describe, it, expect } from 'vitest';
import { validateInput, safeValidateInput } from '../utils/validation';
import { UserRegistrationSchema, HelpSeekerSubmissionSchema } from '../schemas/user';

describe('Backend Setup', () => {
  it('should validate user registration input correctly', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      description: 'This is a detailed description of the help I need',
    };

    const result = validateInput(UserRegistrationSchema, validInput);
    expect(result).toEqual(validInput);
  });

  it('should reject invalid email in user registration', () => {
    const invalidInput = {
      email: 'invalid-email',
      password: 'password123',
      fullName: 'John Doe',
      description: 'This is a detailed description of the help I need',
    };

    expect(() => validateInput(UserRegistrationSchema, invalidInput)).toThrow();
  });

  it('should validate help seeker submission input correctly', () => {
    const validInput = {
      description: 'This is a detailed description of the help needed',
    };

    const result = validateInput(HelpSeekerSubmissionSchema, validInput);
    expect(result).toEqual(validInput);
  });

  it('should safely validate input and return null for invalid data', () => {
    const invalidInput = {
      email: 'invalid-email',
      password: 'short',
    };

    const result = safeValidateInput(UserRegistrationSchema, invalidInput);
    expect(result).toBeNull();
  });

  it('should handle missing optional fields', () => {
    const inputWithoutPhone = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
      description: 'This is a detailed description of the help I need',
    };

    const result = validateInput(UserRegistrationSchema, inputWithoutPhone);
    expect(result.phoneNumber).toBeUndefined();
  });

  it('should reject registration without description', () => {
    const inputWithoutDescription = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
    };

    expect(() => validateInput(UserRegistrationSchema, inputWithoutDescription)).toThrow();
  });

  it('should reject description that is too short', () => {
    const inputWithShortDescription = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
      phoneNumber: '+1234567890',
      description: 'Too short',
    };

    expect(() => validateInput(UserRegistrationSchema, inputWithShortDescription)).toThrow();
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

    expect(() => validateInput(UserRegistrationSchema, inputWithLongDescription)).toThrow();
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

    const result = validateInput(UserRegistrationSchema, validInput);
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

    const result = validateInput(UserRegistrationSchema, validInput);
    expect(result.description).toBe(maxDescription);
  });
});
