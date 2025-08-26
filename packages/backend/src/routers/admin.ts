import { ApiResponseSchema } from '../schemas/api';
import logger from '../utils/logger';
import { supabase } from '../utils/supabase';
import { t, protectedProcedure } from './shared';
import type { Database } from '../types/GENERATED_database.types';
import { z } from 'zod';
import {
  AdminUserListInputSchema,
  AdminUserListOutputSchema,
  AdminUserActionInputSchema,
  AdminUserActionOutputSchema,
  SuperAdminUpgradeUserInputSchema,
  SuperAdminUpgradeUserOutputSchema,
} from '../types/supabase-types';

// Admin middleware - checks if user has admin role
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  logger.info('Admin middleware called for user:', ctx.user.id);

  // Check if user has admin role
  const { data: userData, error } = await supabase.from('users').select('role').eq('id', ctx.user.id).single();

  logger.info('Admin middleware query result:', { userData, error });

  if (error) {
    logger.error('Admin middleware query error:', error);
    throw new Error(`Admin role check failed: ${error.message}`);
  }

  if (!userData) {
    logger.error('Admin middleware: User not found');
    throw new Error('User not found in database');
  }

  if (userData.role !== 'admin' && userData.role !== 'super_admin') {
    logger.error('User does not have admin role:', userData.role);
    throw new Error('Admin access required');
  }

  return next({
    ctx: {
      ...ctx,
      adminUser: userData,
    },
  });
});

// Super admin middleware - checks if user has super_admin role
const superAdminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  logger.info('Super admin middleware called for user:', ctx.user.id);

  // Check if user has super_admin role
  const { data: userData, error } = await supabase.from('users').select('role').eq('id', ctx.user.id).single();

  logger.info('Super admin middleware query result:', { userData, error });

  if (error) {
    logger.error('Super admin middleware query error:', error);
    throw new Error(`Super admin role check failed: ${error.message}`);
  }

  if (!userData) {
    logger.error('Super admin middleware: User not found');
    throw new Error('User not found in database');
  }

  if (userData.role !== 'super_admin') {
    logger.error('User does not have super admin role:', userData.role);
    throw new Error('Super admin access required');
  }

  return next({
    ctx: {
      ...ctx,
      superAdminUser: userData,
    },
  });
});

export const adminRouter = t.router({
  // Get list of users for admin review
  getUsers: adminProcedure
    .input(AdminUserListInputSchema)
    .output(ApiResponseSchema(AdminUserListOutputSchema))
    .query(async ({ input }) => {
      try {
        let query = supabase
          .from('users')
          .select(
            `
            id, url_id, email, full_name, description, phone_number, status, role, verified_by, created_at,
            verified_by_admin:users!verified_by(full_name)
          `
          )
          .eq('role', 'help_seeker') // Only show help_seeker users by default
          .order('created_at', { ascending: false });

        // Apply filters
        if (input.status) {
          query = query.eq('status', input.status);
        }

        // Apply search filter (search in name, email, description)
        if (input.search && input.search.trim()) {
          const searchTerm = input.search.trim();
          query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        // Get total count first (without pagination)
        const countQuery = supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'help_seeker');

        if (input.status) {
          countQuery.eq('status', input.status);
        }

        if (input.search && input.search.trim()) {
          const searchTerm = input.search.trim();
          countQuery.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
          logger.error('Get users count error:', countError);
          throw new Error(`Failed to fetch users count: ${countError.message}`);
        }

        // Add pagination to the main query
        const { data, error } = await query.range(input.offset, input.offset + input.limit - 1);

        if (error) {
          logger.error('Get users query error:', error);
          throw new Error(`Failed to fetch users: ${error.message}`);
        }

        // Fix the verified_by_admin field - Supabase returns arrays for foreign keys
        const VerifiedByAdminSchema = z.object({ full_name: z.string() });
        const getVerifiedByAdmin = (value: unknown): { full_name: string } | null => {
          const result = z.array(VerifiedByAdminSchema).safeParse(value);
          return result.success && result.data.length > 0 ? (result.data[0] ?? null) : null;
        };

        const processedData =
          data?.map(user => ({
            ...user,
            verified_by_admin: getVerifiedByAdmin(user.verified_by_admin),
          })) || [];

        // Validate data structure before returning
        const responseData = {
          users: processedData,
          total: count || 0,
        };

        return {
          success: true,
          data: responseData,
        };
      } catch (error) {
        logger.error('Get users error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch users',
        };
      }
    }),

  // Verify or flag a user
  updateUserStatus: adminProcedure
    .input(AdminUserActionInputSchema)
    .output(ApiResponseSchema(AdminUserActionOutputSchema))
    .mutation(async ({ input, ctx }) => {
      try {
        logger.info('Admin updateUserStatus called with input:', input);
        logger.info('Admin context user:', ctx.user);

        // Create update data using generated types
        const updateData: Database['public']['Tables']['users']['Update'] = {
          status: input.action === 'verify' ? 'verified' : 'flagged',
          verified_at: new Date().toISOString(),
          verified_by: ctx.user.id,
        };

        logger.info('Update data:', updateData);

        // Update user status
        const { data, error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', input.userId)
          .select('id, status, verified_at, verified_by')
          .single();

        if (error) {
          logger.error('Supabase update error details:', error);
          throw new Error(`Failed to update user status: ${error.message}`);
        }

        if (!data) {
          throw new Error('User not found');
        }

        return {
          success: true,
          data: {
            user: data,
            action: input.action,
            remarks: input.remarks,
          },
        };
      } catch (error) {
        logger.error('Update user status error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update user status',
        };
      }
    }),

  // Super admin: Upgrade user to admin role
  upgradeUserRole: superAdminProcedure
    .input(SuperAdminUpgradeUserInputSchema)
    .output(ApiResponseSchema(SuperAdminUpgradeUserOutputSchema))
    .mutation(async ({ input, ctx }) => {
      try {
        logger.info('Super admin upgradeUserRole called with input:', input);
        logger.info('Super admin context user:', ctx.user);

        // Prevent self-modification
        if (input.userId === ctx.user.id) {
          throw new Error('Cannot modify your own role');
        }

        // Get the target user to check current role
        const { data: targetUser, error: fetchError } = await supabase
          .from('users')
          .select('id, email, full_name, role')
          .eq('id', input.userId)
          .single();

        if (fetchError) {
          logger.error('Error fetching target user:', fetchError);
          throw new Error('User not found');
        }

        if (!targetUser) {
          throw new Error('User not found');
        }

        // Prevent downgrading other super admins
        if (targetUser.role === 'super_admin') {
          throw new Error('Cannot modify super admin roles');
        }

        // Create update data using generated types
        const updateData: Database['public']['Tables']['users']['Update'] = {
          role: input.newRole,
          updated_at: new Date().toISOString(),
        };

        logger.info('Update data:', updateData);

        // Update user role
        const { data, error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', input.userId)
          .select('id, email, full_name, role, updated_at')
          .single();

        if (error) {
          logger.error('Supabase update error details:', error);
          throw new Error(`Failed to update user role: ${error.message}`);
        }

        if (!data) {
          throw new Error('User not found');
        }

        const action = input.newRole === 'admin' ? 'upgrade_to_admin' : 'downgrade_to_help_seeker';

        return {
          success: true,
          data: {
            user: data,
            action,
            remarks: input.remarks,
          },
        };
      } catch (error) {
        logger.error('Upgrade user role error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update user role',
        };
      }
    }),
});

export type AdminRouter = typeof adminRouter;
