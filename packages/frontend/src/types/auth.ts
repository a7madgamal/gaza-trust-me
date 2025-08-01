export interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  description: string;
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
    name: string;
  };
}

export interface ValidationErrors {
  // eslint-disable-next-line vibe-coder/no-optional-properties
  email?: string;
  // eslint-disable-next-line vibe-coder/no-optional-properties
  password?: string;
  // eslint-disable-next-line vibe-coder/no-optional-properties
  confirmPassword?: string;
  // eslint-disable-next-line vibe-coder/no-optional-properties
  fullName?: string;
  // eslint-disable-next-line vibe-coder/no-optional-properties
  phoneNumber?: string;
  // eslint-disable-next-line vibe-coder/no-optional-properties
  description?: string;
}
