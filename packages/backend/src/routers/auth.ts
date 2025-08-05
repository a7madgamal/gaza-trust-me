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

        // If email verification is disabled, auto-confirm the user
        if (!env.ENABLE_EMAIL_VERIFICATION) {
          // Keep the metadata options even when email verification is disabled
        } else if (env.FRONTEND_URL) {
          if (signUpOptions.options) {
            signUpOptions.options.emailRedirectTo = `${env.FRONTEND_URL}/auth/callback`;
          } else {
            signUpOptions.options = {
              emailRedirectTo: `${env.FRONTEND_URL}/auth/callback`,
            };
          }
        }

        logger.info('SignUp options:', JSON.stringify(signUpOptions, null, 2));
        const { data: authData, error: authError } = await supabase.auth.signUp(signUpOptions);

        if (authError) {
          logger.error('Auth signup error:', authError);
          throw new Error(authError.message);
        }

        if (!authData.user) {
          throw new Error('Failed to create user');
        }

        // If email verification is disabled, auto-confirm the user
        if (!env.ENABLE_EMAIL_VERIFICATION) {
          await supabase.auth.admin.updateUserById(authData.user.id, {
            email_confirm: true,
          });
        }

        // User profile is created automatically by database trigger
        // No need to manually insert - the trigger handles it

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
});

export type AuthRouter = typeof authRouter;
