import { ApiResponseSchema } from '../schemas/api';
import { env } from '../utils/env';
import logger from '../utils/logger';
import { supabase } from '../utils/supabase';
import { t, publicProcedure, protectedProcedure } from './shared';
import {
  AuthRegistrationInputSchema,
  AuthLoginInputSchema,
  AuthRegistrationOutputSchema,
  AuthLoginOutputSchema,
  AuthLogoutOutputSchema,
} from '../types/supabase-types';
import { z } from 'zod';

export const authRouter = t.router({
  register: publicProcedure
    .input(AuthRegistrationInputSchema)
    .output(ApiResponseSchema(AuthRegistrationOutputSchema))
    .mutation(async ({ input }) => {
      try {
        // Create user in Supabase Auth with email verification control
        const signUpOptions: {
          email: string;
          password: string;
          options?: {
            emailRedirectTo?: string;
            data?: {
              full_name: string;
              phone_number: string;
              description: string;
              linkedin_url?: string;
              campaign_url?: string;
            };
          };
        } = {
          email: input.email,
          password: input.password,
          options: {
            data: {
              full_name: input.fullName,
              phone_number: input.phoneNumber,
              description: input.description,
              ...(input.linkedinUrl && { linkedin_url: input.linkedinUrl }),
              ...(input.campaignUrl && { campaign_url: input.campaignUrl }),
            },
          },
        };

        if (signUpOptions.options) {
          signUpOptions.options.emailRedirectTo = `${env.FRONTEND_URL}/auth/callback`;
        } else {
          signUpOptions.options = {
            emailRedirectTo: `${env.FRONTEND_URL}/auth/callback`,
          };
        }

        const { data: authData, error: authError } = await supabase.auth.signUp(signUpOptions);

        if (authError) {
          throw new Error(authError.message);
        }

        if (!authData.user) {
          throw new Error('Failed to create user');
        }

        return {
          success: true,
          data: {
            userId: authData.user.id,
          },
        };
      } catch (error) {
        logger.error('Registration error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Registration failed',
        };
      }
    }),

  login: publicProcedure
    .input(AuthLoginInputSchema)
    .output(ApiResponseSchema(AuthLoginOutputSchema))
    .mutation(async ({ input }) => {
      try {
        // Sign in user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (!data.user || !data.session) {
          throw new Error('Login failed');
        }

        // Get user role from database
        logger.info('Looking for user profile with ID:', data.user.id);
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role, status')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData) {
          logger.error('User profile not found. Error:', userError);
          logger.error('User data:', userData);
          throw new Error(`User profile not found: ${userError?.message || 'Unknown error'}`);
        }

        return {
          success: true,
          data: {
            token: data.session.access_token,
            user: {
              id: data.user.id,
              email: data.user.email ?? '',
              role: userData.role,
              status: userData.status,
            },
          },
        };
      } catch (error) {
        logger.error('Login error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Login failed',
        };
      }
    }),

  logout: protectedProcedure.output(ApiResponseSchema(AuthLogoutOutputSchema)).mutation(async () => {
    try {
      // Sign out user
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: {
          success: true,
        },
      };
    } catch (error) {
      logger.error('Logout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }),

  // PKCE callback endpoint for auth code exchange
  callback: publicProcedure
    .input(
      z.object({
        code: z.string().min(1, 'Auth code is required'),
        state: z.string().optional(),
      })
    )
    .output(
      ApiResponseSchema(
        z.object({
          token: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string(),
            role: z.string(),
            status: z.string().nullable(),
          }),
        })
      )
    )
    .mutation(async ({ input }) => {
      try {
        logger.info('Processing PKCE callback with code:', input.code.substring(0, 10) + '...');

        // Exchange auth code for session using PKCE
        const { data, error } = await supabase.auth.exchangeCodeForSession(input.code);

        if (error) {
          logger.error('PKCE code exchange error:', error);
          throw new Error(error.message);
        }

        if (!data.user || !data.session) {
          throw new Error('Failed to exchange code for session');
        }

        // Get user role from database
        logger.info('Looking for user profile with ID:', data.user.id);
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role, status')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData) {
          logger.error('User profile not found. Error:', userError);
          throw new Error(`User profile not found: ${userError?.message || 'Unknown error'}`);
        }

        logger.info('PKCE callback successful for user:', data.user.email);

        return {
          success: true,
          data: {
            token: data.session.access_token,
            user: {
              id: data.user.id,
              email: data.user.email ?? '',
              role: userData.role,
              status: userData.status,
            },
          },
        };
      } catch (error) {
        logger.error('PKCE callback error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Auth callback failed',
        };
      }
    }),
});

export type AuthRouter = typeof authRouter;
