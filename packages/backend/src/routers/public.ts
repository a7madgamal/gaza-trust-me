import { z } from 'zod';
import { ApiResponseSchema } from '../schemas/api';
import { supabase } from '../utils/supabase';
import logger from '../utils/logger';
import { t, publicProcedure } from './shared';
import {
  PublicUserSchema,
  PublicUserWithNavigationSchema,
  AdminProfileSchema,
  CardStackNavigationInputSchema,
} from '../types/supabase-types';

// Helper function to process verified_by_admin field from Supabase foreign key join
const processVerifiedByAdmin = (value: unknown): { full_name: string } | null => {
  if (value === null || value === undefined) {
    return null;
  }

  // Handle both array and object cases
  if (Array.isArray(value)) {
    // If it's an array, take the first element
    if (value.length === 0) {
      return null;
    }
    const VerifiedByAdminSchema = z.object({ full_name: z.string() });
    return VerifiedByAdminSchema.parse(value[0]);
  } else {
    // If it's an object, parse it directly
    const VerifiedByAdminSchema = z.object({ full_name: z.string() });
    return VerifiedByAdminSchema.parse(value);
  }
};

// Helper function to get adjacent user IDs
const getAdjacentUserIds = async (
  currentUserId: string
): Promise<{ nextUserUrlId: number | null; previousUserUrlId: number | null }> => {
  const { data: currentUser } = await supabase
    .from('users')
    .select('view_count, created_at')
    .eq('id', currentUserId)
    .single();

  if (!currentUser) {
    return { nextUserUrlId: null, previousUserUrlId: null };
  }

  // Get next user URL ID
  const { data: nextUser } = await supabase
    .from('users')
    .select('url_id')
    .in('role', ['help_seeker', 'admin'])
    .not('status', 'is', null)
    .eq('status', 'verified')
    .not('verified_by', 'is', null)
    .or(
      `view_count.gt.${currentUser.view_count},and(view_count.eq.${currentUser.view_count},created_at.lt.${currentUser.created_at})`
    )
    .order('view_count', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Get previous user URL ID
  const { data: previousUser } = await supabase
    .from('users')
    .select('url_id')
    .in('role', ['help_seeker', 'admin'])
    .not('status', 'is', null)
    .eq('status', 'verified')
    .not('verified_by', 'is', null)
    .or(
      `view_count.lt.${currentUser.view_count},and(view_count.eq.${currentUser.view_count},created_at.gt.${currentUser.created_at})`
    )
    .order('view_count', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  return {
    nextUserUrlId: nextUser?.url_id || null,
    previousUserUrlId: previousUser?.url_id || null,
  };
};

export const publicRouter = t.router({
  // Get user data with navigation info (modern approach - single API call)
  getUserData: publicProcedure
    .input(z.object({ urlId: z.number().int().positive() }))
    .output(PublicUserWithNavigationSchema.nullable())
    .query(async ({ input }) => {
      try {
        // Fetch the user
        const { data, error } = await supabase
          .from('users')
          .select(
            'id, url_id, full_name, description, phone_number, status, role, verified_at, verified_by, verified_by_admin:verified_by(full_name), created_at, view_count, linkedin_url, campaign_url, facebook_url, telegram_url'
          )
          .eq('url_id', input.urlId)
          .in('role', ['help_seeker', 'admin'])
          .not('status', 'is', null)
          .eq('status', 'verified')
          .not('verified_by', 'is', null)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null;
          }
          logger.error('Error fetching user:', error);
          throw new Error('Failed to fetch user');
        }

        if (!data) return null;

        // Process and validate verified users
        if (data.status === 'verified') {
          if (!data.verified_by) {
            throw new Error(`Verified user ${data.id} has no verified_by value`);
          }
          data.verified_by_admin = processVerifiedByAdmin(data.verified_by_admin);
          if (!data.verified_by_admin) {
            throw new Error(`Verified user ${data.id} has no admin data - admin ${data.verified_by} not found`);
          }
        }

        // Get adjacent user URL IDs
        const { nextUserUrlId, previousUserUrlId } = await getAdjacentUserIds(data.id);

        return {
          ...data,
          nextUserUrlId,
          previousUserUrlId,
        };
      } catch (error) {
        logger.error('Error in getUserData:', error);
        throw new Error('Failed to fetch user data');
      }
    }),

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

  getNextUser: publicProcedure
    .input(CardStackNavigationInputSchema)
    .output(PublicUserSchema.nullable())
    .query(async ({ input }) => {
      try {
        let query = supabase
          .from('users')
          .select(
            'id, url_id, full_name, description, phone_number, status, role, verified_at, verified_by, verified_by_admin:verified_by(full_name), created_at, view_count, linkedin_url, campaign_url, facebook_url, telegram_url'
          )
          .in('role', ['help_seeker', 'admin']) // Show help seekers and admins (but not super admins)
          .not('status', 'is', null) // Ensure status is not null
          .eq('status', 'verified')
          .not('verified_by', 'is', null); // Exclude verified users with null verified_by

        // If we have a current user, get the next one after them
        if (input.currentUserId) {
          const { data: currentUser } = await supabase
            .from('users')
            .select('view_count, created_at')
            .eq('id', input.currentUserId)
            .single();

          if (currentUser) {
            // Fetch user with view_count > current (strict inequality to avoid loops)
            // OR same view_count but older created_at (to handle ties)
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
              'id, url_id, full_name, description, phone_number, status, role, verified_at, verified_by, verified_by_admin:verified_by(full_name), created_at, view_count, linkedin_url, campaign_url, facebook_url, telegram_url'
            )
            .in('role', ['help_seeker', 'admin']) // Show help seekers and admins (but not super admins)
            .not('status', 'is', null)
            .eq('status', 'verified')
            .not('verified_by', 'is', null) // Exclude verified users with null verified_by
            .order('view_count', { ascending: true })
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (firstUserError && firstUserError.code !== 'PGRST116') {
            logger.error('Error fetching first user:', firstUserError);
            throw new Error('Failed to fetch first user');
          }

          // Process the joined data and validate
          if (firstUser) {
            // Validate that verified users have verified_by and admin data
            if (firstUser.status === 'verified') {
              if (!firstUser.verified_by) {
                throw new Error(`Verified user ${firstUser.id} has no verified_by value`);
              }
              if (!firstUser.verified_by_admin) {
                throw new Error(
                  `Verified user ${firstUser.id} has no admin data - admin ${firstUser.verified_by} not found`
                );
              }
            }
            if (firstUser.status === 'verified') {
              firstUser.verified_by_admin = processVerifiedByAdmin(firstUser.verified_by_admin);
            }
          }
          return firstUser;
        }

        // Process the joined data and validate
        if (data) {
          // Process and validate verified users
          if (data.status === 'verified') {
            if (!data.verified_by) {
              throw new Error(`Verified user ${data.id} has no verified_by value`);
            }
            data.verified_by_admin = processVerifiedByAdmin(data.verified_by_admin);
            // Aggressive validation: verified users MUST have admin data
            if (!data.verified_by_admin) {
              throw new Error(`Verified user ${data.id} has no admin data - admin ${data.verified_by} not found`);
            }
          }
        }
        return data;
      } catch (error) {
        logger.error('Error in getNextUser:', error);
        throw new Error('Failed to fetch next user');
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
