import { RegistrationFormData, ValidationErrors } from '@/types/auth';
import { z } from 'zod';

export const validateEmail = (email: string): string | undefined => {
  if (!email) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }

  return undefined;
};

export const validateFullName = (fullName: string): string | undefined => {
  if (!fullName) {
    return 'Full name is required';
  }

  if (fullName.trim().length < 2) {
    return 'Full name must be at least 2 characters long';
  }

  return undefined;
};

export const validatePhoneNumber = (phoneNumber: string): string | undefined => {
  if (!phoneNumber) {
    return 'Phone number is required';
  }

  // Basic phone number validation - allows various formats
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phoneNumber.replace(/[\s\-()]/g, ''))) {
    return 'Please enter a valid phone number';
  }

  return undefined;
};

export const validateDescription = (description: string): string | undefined => {
  if (!description) {
    return 'Description is required';
  }

  if (description.trim().length < 10) {
    return 'Description must be at least 10 characters long';
  }

  if (description.trim().length > 2000) {
    return 'Description must be less than 2000 characters';
  }

  return undefined;
};

export const validateUrl = (url: string, fieldName: string): string | undefined => {
  if (!url) {
    return undefined; // Optional field
  }

  try {
    new URL(url);
  } catch {
    return `Please enter a valid ${fieldName} URL`;
  }

  return undefined;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return undefined;
};

export const validateRegistrationForm = (formData: RegistrationFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  const fullNameError = validateFullName(formData.fullName);
  if (fullNameError) {
    errors.fullName = fullNameError;
  }

  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(formData.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
  if (confirmPasswordError) {
    errors.confirmPassword = confirmPasswordError;
  }

  const phoneNumberError = validatePhoneNumber(formData.phoneNumber);
  if (phoneNumberError) {
    errors.phoneNumber = phoneNumberError;
  }

  const descriptionError = validateDescription(formData.description);
  if (descriptionError) {
    errors.description = descriptionError;
  }

  const linkedinUrlError = validateUrl(formData.linkedinUrl, 'LinkedIn');
  if (linkedinUrlError) {
    errors.linkedinUrl = linkedinUrlError;
  }

  const campaignUrlError = validateUrl(formData.campaignUrl, 'campaign');
  if (campaignUrlError) {
    errors.campaignUrl = campaignUrlError;
  }

  return errors;
};

export const isFormValid = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length === 0;
};

// Session data schema - matches actual Supabase AuthSession structure
export const SessionDataSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  expires_at: z.number(),
  token_type: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    user_metadata: z
      .object({
        role: z.string().optional(),
        full_name: z.string().optional(),
        email: z.string().optional(),
        phone_number: z.string().optional(),
        description: z.string().optional(),
        linkedin_url: z.string().optional(),
        campaign_url: z.string().optional(),
      })
      .optional(),
  }),
});

export type SessionData = z.infer<typeof SessionDataSchema>;

// User schema for JWT payload
export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(['help_seeker', 'admin', 'super_admin']),
});

export type ValidatedUser = z.infer<typeof UserSchema>;

// Auth tokens schema
export const AuthTokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  expires_at: z.number(),
  token_type: z.string(),
  type: z.string(),
});

export type AuthTokens = z.infer<typeof AuthTokensSchema>;

// Utility functions for safe JSON parsing
export const parseSessionData = (json: string): SessionData | null => {
  try {
    const parsed = JSON.parse(json) as unknown;
    return SessionDataSchema.parse(parsed);
  } catch (error) {
    console.error('Failed to parse session data:', error);
    return null;
  }
};

export const parseUser = (json: string): ValidatedUser | null => {
  try {
    const parsed = JSON.parse(json) as unknown;
    return UserSchema.parse(parsed);
  } catch {
    return null;
  }
};

export const parseAuthTokens = (json: string): AuthTokens | null => {
  try {
    const parsed = JSON.parse(json) as unknown;
    return AuthTokensSchema.parse(parsed);
  } catch {
    return null;
  }
};
