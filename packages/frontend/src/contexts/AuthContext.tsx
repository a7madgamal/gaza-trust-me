import React, { useState, useEffect } from 'react';
import { AuthContext, type AuthContextUser, type UserProfile } from './AuthContextDef';
import { supabase } from '../lib/supabase';
import { trpcClient } from '../utils/trpc';
import type { User as SupabaseUser, AuthSession } from '@supabase/supabase-js';
import { z } from 'zod';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthContextUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Supabase user to our User type
  const convertSupabaseUser = (supabaseUser: SupabaseUser): AuthContextUser => {
    if (!supabaseUser.email) {
      throw new Error('Supabase user must have an email');
    }

    const RoleSchema = z.enum(['help_seeker', 'admin', 'super_admin']).optional();
    const metadata = supabaseUser.user_metadata;

    // If role is not in metadata, we'll get it from the profile later
    // For now, default to help_seeker to avoid validation errors
    let parsedRole = RoleSchema.parse(metadata?.role);

    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      role: parsedRole,
    };
  };

  // Fetch user profile from our backend using tRPC
  const fetchUserProfile = async (session: AuthSession): Promise<UserProfile | null> => {
    try {
      // Store session for tRPC client headers
      localStorage.setItem('session', JSON.stringify(session));

      const profileData = await trpcClient.getProfile.query();

      if (profileData.success && profileData.data) {
        if (!profileData.data.status) {
          throw new Error('missing user status');
        }

        const transformedProfile: UserProfile = {
          id: profileData.data.id,
          email: profileData.data.email,
          full_name: profileData.data.full_name,
          phone_number: profileData.data.phone_number,
          role: profileData.data.role,
          description: profileData.data.description,
          status: profileData.data.status,
          verifiedAt: profileData.data.verified_at,
          verifiedBy: profileData.data.verified_by,
        };
        setUserProfile(transformedProfile);

        // Update the user's role based on the profile
        setUser(prevUser => {
          if (prevUser && profileData.data) {
            return {
              ...prevUser,
              role: profileData.data.role,
            };
          }
          return prevUser;
        });

        return transformedProfile;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserProfile(null);
      setUser(null);
      // Clear session from localStorage when profile fetch fails
      localStorage.removeItem('session');
      return null;
    }
  };

  const login = async (
    email: string,
    password: string,
    onProfileLoaded?: (userProfile: UserProfile | null) => void
  ) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const user = convertSupabaseUser(data.user);
        setUser(user);

        if (data.session) {
          const profile = await fetchUserProfile(data.session);
          // Call the callback with the loaded profile
          if (onProfileLoaded) {
            onProfileLoaded(profile);
          }
        }

        return { user };
      }

      return null;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check if user needs email confirmation
        if (!data.session) {
          // No session means email confirmation is required
          return { user: null, requiresEmailVerification: true as const };
        }

        const user = convertSupabaseUser(data.user);
        setUser(user);

        if (data.session) {
          await fetchUserProfile(data.session);
        }

        return { user };
      }

      return null;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('session');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if logout fails
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('session');
    }
  };

  // Handle auth state changes
  useEffect(() => {
    // Get initial session
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user = convertSupabaseUser(session.user);
        setUser(user);
        void fetchUserProfile(session);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = convertSupabaseUser(session.user);
        setUser(user);
        void fetchUserProfile(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Refresh profile data when token is refreshed
        void fetchUserProfile(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        signup,
        logout,
        fetchUserProfile: async () => {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            await fetchUserProfile(session);
          }
        },
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
