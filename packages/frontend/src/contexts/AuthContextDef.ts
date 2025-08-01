import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  description: string;
  status: string;
  // eslint-disable-next-line vibe-coder/no-optional-properties
  verifiedAt?: string | null;
  // eslint-disable-next-line vibe-coder/no-optional-properties
  verifiedBy?: string | null;
}

interface AuthContextType {
  // eslint-disable-next-line vibe-coder/no-optional-properties
  user: User | null;
  // eslint-disable-next-line vibe-coder/no-optional-properties
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
