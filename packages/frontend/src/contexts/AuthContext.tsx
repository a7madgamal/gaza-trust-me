import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type User, type UserProfile } from './AuthContextDef';
import { trpc } from '../utils/trpc';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Use tRPC React hook for fetching user profile
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = trpc.getProfile.useQuery(undefined, {
    enabled: !!user, // Only fetch when user is logged in
    retry: false,
  });

  // Update userProfile when profileData changes
  useEffect(() => {
    if (profileData?.success && profileData.data) {
      setUserProfile(profileData.data);
    }
  }, [profileData]);

  // Handle authentication errors by logging out
  useEffect(() => {
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // If it's an authentication error, logout the user
      if (profileError.data?.code === 'UNAUTHORIZED' || profileError.message?.includes('Invalid token')) {
        localStorage.removeItem('session');
        setUser(null);
        setUserProfile(null);
        navigate('/login');
      }
    }
  }, [profileError, navigate]);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const loginMutation = trpc.login.useMutation();

  const login = async (email: string, password: string) => {
    try {
      const result = await loginMutation.mutateAsync({ email, password });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Login failed');
      }

      const sessionData = {
        access_token: result.data.token,
        user: result.data.user,
      };

      localStorage.setItem('session', JSON.stringify(sessionData));
      setUser(result.data.user);

      // Profile will be fetched automatically by the tRPC hook when user is set
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logoutMutation = trpc.logout.useMutation();

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('session');
      setUser(null);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const session = localStorage.getItem('session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.user && sessionData.access_token) {
          setUser(sessionData.user);
          // Profile will be fetched automatically by the tRPC hook when user is set
          // If the token is invalid, the profileError useEffect will handle logout
        } else {
          setUser(null);
          localStorage.removeItem('session');
        }
      } catch (error) {
        console.error('Error parsing session:', error);
        localStorage.removeItem('session');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading: loading || (!!user && profileLoading),
        login,
        logout,
        fetchUserProfile: async () => {}, // Keep for compatibility, but it's no longer needed
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
