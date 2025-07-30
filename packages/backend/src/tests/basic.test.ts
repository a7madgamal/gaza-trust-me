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
    };

    const result = validateInput(UserRegistrationSchema, validInput);
    expect(result).toEqual(validInput);
  });

  it('should reject invalid email in user registration', () => {
    const invalidInput = {
      email: 'invalid-email',
      password: 'password123',
      fullName: 'John Doe',
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
    };

    const result = validateInput(UserRegistrationSchema, inputWithoutPhone);
    expect(result.phoneNumber).toBeUndefined();
  });
});
