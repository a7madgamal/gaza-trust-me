import React, {useState, useEffect} from "react";
import {config} from "../utils/config";
import {AuthContext} from "./AuthContextDef";

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

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const session = localStorage.getItem("session");
      const sessionData = session ? JSON.parse(session) : null;

      if (!sessionData?.access_token) {
        return;
      }

      const response = await fetch(`${config.apiUrl}/trpc/getProfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.access_token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.result?.data?.success) {
        setUserProfile(data.result.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email, password}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const sessionData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: data.user,
      };

      localStorage.setItem("session", JSON.stringify(sessionData));
      setUser(data.user);

      // Fetch user profile after login
      await fetchUserProfile();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("session");
    setUser(null);
    setUserProfile(null);
  };

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.user) {
          setUser(sessionData.user);
          fetchUserProfile();
        }
      } catch (error) {
        console.error("Error parsing session:", error);
        localStorage.removeItem("session");
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        logout,
        fetchUserProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
