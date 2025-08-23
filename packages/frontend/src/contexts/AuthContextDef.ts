import { createContext } from 'react';

export interface AuthContextUser {
  id: string;
  email: string;
  role?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: 'help_seeker' | 'admin' | 'super_admin';
  description: string;
  status: string;
  url_id: number;
  created_at: string | null;
  updated_at: string | null;
  linkedin_url: string | null;
  campaign_url: string | null;

  verifiedAt?: string | null;
  verifiedBy?: string | null;
}

interface AuthContextType {
  user: AuthContextUser | null;

  userProfile: UserProfile | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    onProfileLoaded?: (userProfile: UserProfile | null) => void
  ) => Promise<{ user: AuthContextUser } | null>;
  signup: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => Promise<{ user: AuthContextUser } | { user: null; requiresEmailVerification: true } | null>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  setUser: (user: AuthContextUser | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
