import { initTRPC, TRPCError } from '@trpc/server';

// Define context type
export interface Context {
  user?:
    | {
        id: string;
        email: string;
        role: string;
      }
    | undefined;
}

// Initialize tRPC with context
export const t = initTRPC.context<Context>().create();

// Middleware for protected routes
export const requireAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Public and protected procedures
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(requireAuth);
