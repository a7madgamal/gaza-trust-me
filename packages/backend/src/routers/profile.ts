import { z } from 'zod';
import { ApiResponseSchema } from '../schemas/api';
import { UserProfileUpdateSchema } from '../schemas/user';
import logger from '../utils/logger';
import { supabase } from '../utils/supabase';
import type { Database } from '../types/database.types';
import { t, protectedProcedure } from './shared';

export const profileRouter = t.router({
  getProfile: protectedProcedure
    .output(
      ApiResponseSchema(
        z.object({
          id: z.string(),
          email: z.string(),
          full_name: z.string(),
          phone_number: z.string(),
          role: z.enum(['help_seeker', 'admin', 'super_admin']),
          description: z.string(),
          status: z.enum(['pending', 'verified', 'flagged']).nullable(),
          verified_at: z.string().nullable(),
          verified_by: z.string().nullable(),
        })
      )
    )
    .query(async ({ ctx }) => {
      try {
        // Get user profile from database using strict Supabase types
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, email, full_name, phone_number, role, description, status, verified_at, verified_by')
          .eq('id', ctx.user.id)
          .single();

        if (error || !userData) {
          logger.error('Get profile error:', error);
          logger.error('User data:', userData);
          throw new Error(`User profile not found: ${error?.message || 'Unknown error'}`);
        }

        return {
          success: true,
          data: {
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
            phone_number: userData.phone_number,
            role: userData.role,
            description: userData.description,
            status: userData.status,
            verified_at: userData.verified_at,
            verified_by: userData.verified_by,
          },
        };
      } catch (error) {
        logger.error('Get profile error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get profile',
        };
      }
    }),

  updateProfile: protectedProcedure
    .input(UserProfileUpdateSchema)
    .output(
      ApiResponseSchema(
        z.object({
          user: z.object({
            id: z.string(),
            full_name: z.string(),
            phone_number: z.string(),
            description: z.string(),
            updated_at: z.string().nullable(),
          }),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Only update fields that are provided
        const updateData: Database['public']['Tables']['users']['Update'] = {
          updated_at: new Date().toISOString(),
        };

        if (input.full_name !== undefined) {
          updateData.full_name = input.full_name;
        }
        if (input.phone_number !== undefined) {
          updateData.phone_number = input.phone_number;
        }
        if (input.description !== undefined) {
          updateData.description = input.description;
        }

        // Update user profile in database
        const { data, error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', ctx.user.id)
          .select('id, full_name, phone_number, description, updated_at')
          .single();

        if (error) {
          logger.error('Supabase update error:', error);
          throw new Error(`Failed to update profile: ${error.message}`);
        }

        if (!data) {
          throw new Error('User not found');
        }

        return {
          success: true,
          data: {
            user: data,
          },
        };
      } catch (error) {
        logger.error('Update profile error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update profile',
        };
      }
    }),
});

export type ProfileRouter = typeof profileRouter;
