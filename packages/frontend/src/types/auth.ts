export interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}
