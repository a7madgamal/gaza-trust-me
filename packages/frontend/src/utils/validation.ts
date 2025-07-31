import {RegistrationFormData, ValidationErrors} from "@/types/auth";

export const validateEmail = (email: string): string | undefined => {
  if (!email) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }

  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return "Password must contain at least one letter and one number";
  }

  return undefined;
};

export const validateFullName = (fullName: string): string | undefined => {
  if (!fullName) {
    return "Full name is required";
  }

  if (fullName.trim().length < 2) {
    return "Full name must be at least 2 characters long";
  }

  return undefined;
};

export const validatePhoneNumber = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _phoneNumber: string
): string | undefined => {
  // Phone number is optional, so no validation needed
  return undefined;
};

export const validateDescription = (
  description: string
): string | undefined => {
  if (!description) {
    return "Description is required";
  }

  if (description.trim().length < 10) {
    return "Description must be at least 10 characters long";
  }

  if (description.trim().length > 2000) {
    return "Description must be less than 2000 characters";
  }

  return undefined;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | undefined => {
  if (!confirmPassword) {
    return "Please confirm your password";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return undefined;
};

export const validateRegistrationForm = (
  formData: RegistrationFormData
): ValidationErrors => {
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

  const confirmPasswordError = validateConfirmPassword(
    formData.password,
    formData.confirmPassword
  );
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

  return errors;
};

export const isFormValid = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length === 0;
};
