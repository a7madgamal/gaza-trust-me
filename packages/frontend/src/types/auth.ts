export interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  description: string;
  linkedinUrl: string;
  campaignUrl: string;
  facebookUrl: string;
  telegramUrl: string;
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
  email?: string;

  password?: string;

  confirmPassword?: string;

  fullName?: string;

  phoneNumber?: string;

  description?: string;

  linkedinUrl?: string;

  campaignUrl?: string;

  facebookUrl?: string;

  telegramUrl?: string;
}
