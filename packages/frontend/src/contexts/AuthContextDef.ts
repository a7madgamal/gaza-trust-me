import {createContext} from "react";

interface User {
  id: string;
  email: string;
  role: string;
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  description: string;
  status: "pending" | "verified" | "flagged";
  verifiedAt?: string;
  verifiedBy?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUserProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
