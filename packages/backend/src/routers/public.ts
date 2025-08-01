import { z } from 'zod';
import { ApiResponseSchema } from '../schemas/api';
import { PublicUserSchema, CardStackNavigationSchema } from '../schemas/api';
import { supabase } from '../utils/supabase';
import { t, publicProcedure } from './shared';

export const publicRouter = t.router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .output(ApiResponseSchema(z.object({ greeting: z.string() })))
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
    .input(
      z.object({
        limit: z.number().int().positive().max(50).default(10),
        offset: z.number().int().nonnegative().default(0),
      })
    )
    .output(z.array(PublicUserSchema))
    .query(async ({ input }) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, description, phone_number, status, role, created_at')
          .eq('role', 'help_seeker') // Only show help seekers
          .eq('status', 'verified') // Only verified users
          .order('created_at', { ascending: false }) // Newest first
          .range(input.offset, input.offset + input.limit - 1);

        if (error) {
          console.error('Error fetching users for cards:', error);
          throw new Error('Failed to fetch users');
        }

        return data || [];
      } catch (error) {
        console.error('Error in getUsersForCards:', error);
        throw new Error('Failed to fetch users');
      }
    }),

  getNextUser: publicProcedure
    .input(CardStackNavigationSchema)
    .output(PublicUserSchema.nullable())
    .query(async ({ input }) => {
      try {
        let query = supabase
          .from('users')
          .select('id, full_name, description, phone_number, status, role, created_at')
          .eq('role', 'help_seeker')
          .eq('status', 'verified');

        // If we have a current user, get the next one after them
        if (input.currentUserId) {
          const { data: currentUser } = await supabase
            .from('users')
            .select('created_at')
            .eq('id', input.currentUserId)
            .single();

          if (currentUser) {
            query = query.lt('created_at', currentUser.created_at);
          }
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(1).single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned
          console.error('Error fetching next user:', error);
          throw new Error('Failed to fetch next user');
        }

        return data;
      } catch (error) {
        console.error('Error in getNextUser:', error);
        throw new Error('Failed to fetch next user');
      }
    }),

  getVerifiedUserCount: publicProcedure.output(z.number()).query(async () => {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'help_seeker')
        .eq('status', 'verified');

      if (error) {
        console.error('Error fetching user count:', error);
        throw new Error('Failed to fetch user count');
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getVerifiedUserCount:', error);
      throw new Error('Failed to fetch user count');
    }
  }),
});

export type PublicRouter = typeof publicRouter;
