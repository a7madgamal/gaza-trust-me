import { z } from 'zod';
import { ApiResponseSchema } from '../schemas/api';
import { supabase } from '../utils/supabase';
import logger from '../utils/logger';
import { t, publicProcedure } from './shared';
import {
  PublicHelloInputSchema,
  PublicHelloOutputSchema,
  PublicUsersForCardsInputSchema,
  PublicUserSchema,
  AdminProfileSchema,
  CardStackNavigationInputSchema,
  GetUserByUrlIdInputSchema,
} from '../types/supabase-types';

export const publicRouter = t.router({
  // Increment view count for a user
  incrementViewCount: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        // First get the current view_count
        const { data: currentUser, error: fetchError } = await supabase
          .from('users')
          .select('view_count')
          .eq('id', input.userId)
          .single();

        if (fetchError) {
          logger.error('Error fetching current user:', fetchError);
          throw new Error('Failed to fetch current user');
        }

        // Then increment it
        const { error } = await supabase
          .from('users')
          .update({ view_count: (currentUser.view_count || 0) + 1 })
          .eq('id', input.userId);

        if (error) {
          logger.error('Error incrementing view count:', error);
          throw new Error('Failed to increment view count');
        }

        return { success: true };
      } catch (error) {
        logger.error('Error in incrementViewCount:', error);
        throw new Error('Failed to increment view count');
      }
    }),
  hello: publicProcedure
    .input(PublicHelloInputSchema)
    .output(ApiResponseSchema(PublicHelloOutputSchema))
    .query(({ input }) => {
      return {
        success: true,
        data: {
          greeting: `Hello ${input.name ?? 'world'}!`,
        },
      };
    }),

  // Public user browsing - Card stack interface
  getUsersForCards: publicProcedure
    .input(PublicUsersForCardsInputSchema)
    .output(z.array(PublicUserSchema))
    .query(async ({ input }) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select(
            'id, url_id, full_name, description, phone_number, status, role, verified_at, verified_by, created_at, view_count, linkedin_url, campaign_url, facebook_url, telegram_url'
          )
          .in('role', ['help_seeker', 'admin']) // Show help seekers and admins (but not super admins)
          .not('status', 'is', null) // Ensure status is not null
          .eq('status', 'verified') // Only verified users
          .order('view_count', { ascending: true }) // Lowest view count first
          .order('created_at', { ascending: false }) // Then newest first
          .range(input.offset, input.offset + input.limit - 1);

        if (error) {
          logger.error('Error fetching users for cards:', error);
          throw new Error('Failed to fetch users');
        }

        return data || [];
      } catch (error) {
        logger.error('Error in getUsersForCards:', error);
        throw new Error('Failed to fetch users');
      }
    }),

  getNextUser: publicProcedure
    .input(CardStackNavigationInputSchema)
    .output(PublicUserSchema.nullable())
    .query(async ({ input }) => {
      try {
        let query = supabase
          .from('users')
          .select(
            'id, url_id, full_name, description, phone_number, status, role, verified_at, verified_by, created_at, view_count, linkedin_url, campaign_url, facebook_url, telegram_url'
          )
          .in('role', ['help_seeker', 'admin']) // Show help seekers and admins (but not super admins)
          .not('status', 'is', null) // Ensure status is not null
          .eq('status', 'verified');

        // If we have a current user, get the next one after them
        if (input.currentUserId) {
          const { data: currentUser } = await supabase
            .from('users')
            .select('view_count, created_at')
            .eq('id', input.currentUserId)
            .single();

          if (currentUser) {
            // Since we order by view_count ASC, created_at DESC,
            // "next" means finding users with higher view_count OR same view_count but older created_at
            query = query.or(
              `view_count.gt.${currentUser.view_count},and(view_count.eq.${currentUser.view_count},created_at.lt.${currentUser.created_at})`
            );
          }
        }

        const { data, error } = await query
          .order('view_count', { ascending: true })
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned
          logger.error('Error fetching next user:', error);
          throw new Error('Failed to fetch next user');
        }

        // If no next user found and we have a current user, start from the beginning
        if (!data && input.currentUserId) {
          const { data: firstUser, error: firstUserError } = await supabase
            .from('users')
            .select(
              'id, url_id, full_name, description, phone_number, status, role, verified_at, verified_by, created_at, view_count, linkedin_url, campaign_url, facebook_url, telegram_url'
            )
            .in('role', ['help_seeker', 'admin']) // Show help seekers and admins (but not super admins)
            .not('status', 'is', null)
            .eq('status', 'verified')
            .order('view_count', { ascending: true })
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (firstUserError && firstUserError.code !== 'PGRST116') {
            logger.error('Error fetching first user:', firstUserError);
            throw new Error('Failed to fetch first user');
          }

          return firstUser;
        }

        return data;
      } catch (error) {
        logger.error('Error in getNextUser:', error);
        throw new Error('Failed to fetch next user');
      }
    }),

  getVerifiedUserCount: publicProcedure.output(z.number()).query(async () => {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .in('role', ['help_seeker', 'admin']) // Show help seekers and admins (but not super admins)
        .not('status', 'is', null) // Ensure status is not null
        .eq('status', 'verified');

      if (error) {
        logger.error('Error fetching user count:', error);
        throw new Error('Failed to fetch user count');
      }

      return count || 0;
    } catch (error) {
      logger.error('Error in getVerifiedUserCount:', error);
      throw new Error('Failed to fetch user count');
    }
  }),

  // Get user by URL ID for direct access
  getUserByUrlId: publicProcedure
    .input(GetUserByUrlIdInputSchema)
    .output(PublicUserSchema.nullable())
    .query(async ({ input }) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select(
            'id, url_id, full_name, description, phone_number, status, role, verified_at, verified_by, created_at, view_count, linkedin_url, campaign_url, facebook_url, telegram_url'
          )
          .eq('url_id', input.urlId)
          .in('role', ['help_seeker', 'admin']) // Show help seekers and admins (but not super admins)
          .not('status', 'is', null) // Ensure status is not null
          .eq('status', 'verified')
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No user found with this URL ID
            return null;
          }
          logger.error('Error fetching user by URL ID:', error);
          throw new Error('Failed to fetch user');
        }

        return data;
      } catch (error) {
        logger.error('Error in getUserByUrlId:', error);
        throw new Error('Failed to fetch user');
      }
    }),

  // Get admin profile by ID
  getAdminProfile: publicProcedure
    .input(z.object({ adminId: z.string().uuid().nullable() }))
    .output(ApiResponseSchema(AdminProfileSchema.nullable()))
    .query(async ({ input }) => {
      try {
        if (!input.adminId) {
          return {
            success: true,
            data: null,
          };
        }

        // Get admin basic info - only return if user is actually an admin
        const { data: adminData, error: adminError } = await supabase
          .from('users')
          .select(
            'id, full_name, email, role, created_at, updated_at, phone_number, description, linkedin_url, campaign_url, facebook_url, telegram_url'
          )
          .eq('id', input.adminId)
          .in('role', ['admin', 'super_admin'])
          .single();

        if (adminError || !adminData) {
          logger.error('Error fetching admin:', adminError);
          return {
            success: true,
            data: null, // Admin not found or not an admin
          };
        }

        // Get verification count
        const { count: verificationCount, error: countError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('verified_by', input.adminId)
          .eq('status', 'verified');

        if (countError) {
          logger.error('Error counting verifications:', countError);
          throw new Error('Failed to get verification count');
        }

        return {
          success: true,
          data: {
            id: adminData.id,
            full_name: adminData.full_name,
            email: adminData.email,
            role: adminData.role,
            verification_count: verificationCount || 0,
            created_at: adminData.created_at,
            updated_at: adminData.updated_at,
            phone_number: adminData.phone_number,
            description: adminData.description,
            linkedin_url: adminData.linkedin_url,
            campaign_url: adminData.campaign_url,
            facebook_url: adminData.facebook_url,
            telegram_url: adminData.telegram_url,
          },
        };
      } catch (error) {
        logger.error('Error in getAdminProfile:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch admin profile',
        };
      }
    }),
});

export type PublicRouter = typeof publicRouter;
