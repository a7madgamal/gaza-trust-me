import { ApiResponseSchema } from '../schemas/api';
import logger from '../utils/logger';
import { supabase } from '../utils/supabase';
import { t, protectedProcedure } from './shared';
import type { Database } from '../types/GENERATED_database.types';
import {
  AdminUserListInputSchema,
  AdminUserListOutputSchema,
  AdminUserActionInputSchema,
  AdminUserActionOutputSchema,
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

export const adminRouter = t.router({
  // Get list of users for admin review
  getUsers: adminProcedure
    .input(AdminUserListInputSchema)
    .output(ApiResponseSchema(AdminUserListOutputSchema))
    .query(async ({ input }) => {
      try {
        let query = supabase
          .from('users')
          .select('id, email, full_name, description, phone_number, status, role, created_at')
          .order('created_at', { ascending: false });

        // Filter by status if provided
        if (input.status) {
          query = query.eq('status', input.status);
        }

        // Add pagination
        const { data, error } = await query.range(input.offset, input.offset + input.limit - 1);

        if (error) {
          logger.error('Get users query error:', error);
          throw new Error(`Failed to fetch users: ${error.message}`);
        }

        return {
          success: true,
          data: {
            users: data || [],
            total: data?.length || 0,
          },
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
});

export type AdminRouter = typeof adminRouter;
