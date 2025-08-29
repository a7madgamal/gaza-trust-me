import { ApiResponseSchema } from '../schemas/api';
import logger from '../utils/logger';
import { supabase } from '../utils/supabase';
import type { Database } from '../types/GENERATED_database.types';
import { t, protectedProcedure } from './shared';
import {
  UserProfileUpdateSchema,
  UserProfileOutputSchema,
  UserProfileUpdateOutputSchema,
} from '../types/supabase-types';

export const profileRouter = t.router({
  getProfile: protectedProcedure.output(ApiResponseSchema(UserProfileOutputSchema)).query(async ({ ctx }) => {
    try {
      // Get user profile from database using strict Supabase types
      const { data: userData, error } = await supabase
        .from('users')
        .select(
          'id, url_id, email, full_name, phone_number, role, description, status, verified_at, verified_by, created_at, updated_at, linkedin_url, campaign_url, facebook_url, telegram_url'
        )
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
          url_id: userData.url_id,
          email: userData.email,
          full_name: userData.full_name,
          phone_number: userData.phone_number,
          role: userData.role,
          description: userData.description,
          status: userData.status,
          verified_at: userData.verified_at,
          verified_by: userData.verified_by,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
          linkedin_url: userData.linkedin_url,
          campaign_url: userData.campaign_url,
          facebook_url: userData.facebook_url,
          telegram_url: userData.telegram_url,
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
    .output(ApiResponseSchema(UserProfileUpdateOutputSchema))
    .mutation(async ({ input, ctx }) => {
      try {
        // Only update fields that are provided
        const updateData: Database['public']['Tables']['users']['Update'] = {
          updated_at: new Date().toISOString(),
          // Reset verification status when profile is edited
          status: 'pending',
          verified_at: null,
          verified_by: null,
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
        if (input.linkedin_url !== undefined) {
          updateData.linkedin_url = input.linkedin_url;
        }
        if (input.campaign_url !== undefined) {
          updateData.campaign_url = input.campaign_url;
        }
        if (input.facebook_url !== undefined) {
          updateData.facebook_url = input.facebook_url;
        }
        if (input.telegram_url !== undefined) {
          updateData.telegram_url = input.telegram_url;
        }

        // Update user profile in database
        const { data, error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', ctx.user.id)
          .select(
            'id, full_name, phone_number, description, linkedin_url, campaign_url, facebook_url, telegram_url, updated_at, status'
          )
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
