// Import environment validation first - this will load and validate all env vars
import './utils/env';
import { env } from './utils/env';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ApiResponseSchema } from './schemas/api';
import { UserRegistrationSchema, UserLoginSchema } from './schemas/user';

// Import logger and supabase after environment variables are loaded
import logger from './utils/logger';
import { supabase } from './utils/supabase';
import { createAuthContext } from './middleware/auth';

// Define context type
interface Context {
  user?:
    | {
        id: string;
        email: string;
        role: string;
      }
    | undefined;
}

// Initialize tRPC with context
const t = initTRPC.context<Context>().create();

// Middleware for protected routes
const requireAuth = t.middleware(({ ctx, next }) => {
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
const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(requireAuth);

// Create context function
const createContext = async (opts: { req: express.Request; res: express.Response }): Promise<Context> => {
  try {
    return await createAuthContext(supabase)(opts);
  } catch (error) {
    // For public endpoints (register, login), return undefined user instead of throwing
    // This allows these endpoints to work without authentication
    return { user: undefined };
  }
};

// Basic router with proper types
const appRouter = t.router({
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

  // Authentication procedures
  register: publicProcedure
    .input(UserRegistrationSchema)
    .output(ApiResponseSchema(z.object({ userId: z.string() })))
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
            },
          },
        };

        // If email verification is disabled, auto-confirm the user
        if (!env.ENABLE_EMAIL_VERIFICATION) {
          // Don't set options when email verification is disabled
        } else if (env.FRONTEND_URL) {
          signUpOptions.options = {
            emailRedirectTo: `${env.FRONTEND_URL}/auth/callback`,
          };
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
    .input(UserLoginSchema)
    .output(
      ApiResponseSchema(
        z.object({
          token: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string(),
            role: z.string(),
          }),
        })
      )
    )
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
          .select('role')
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

  logout: protectedProcedure.output(ApiResponseSchema(z.object({ success: z.boolean() }))).mutation(async () => {
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

  getProfile: protectedProcedure
    .output(
      ApiResponseSchema(
        z.object({
          id: z.string(),
          email: z.string(),
          fullName: z.string(),
          phoneNumber: z.string(),
          role: z.string(),
          description: z.string(),
          status: z.string(),
          verifiedAt: z.string().nullable(),
          verifiedBy: z.string().nullable(),
        })
      )
    )
    .query(async ({ ctx }) => {
      try {
        // Get user profile from database
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
            fullName: userData.full_name,
            phoneNumber: userData.phone_number,
            role: userData.role,
            description: userData.description,
            status: userData.status,
            verifiedAt: userData.verified_at,
            verifiedBy: userData.verified_by,
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
    .input(
      z.object({
        fullName: z.string().min(1, 'Full name is required'),
        phoneNumber: z.string().min(1, 'Phone number is required'),
      })
    )
    .output(
      ApiResponseSchema(
        z.object({
          success: z.boolean(),
        })
      )
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Update user profile in database
        const { error } = await supabase
          .from('users')
          .update({
            full_name: input.fullName,
            phone_number: input.phoneNumber,
            updated_at: new Date().toISOString(),
          })
          .eq('id', ctx.user.id);

        if (error) {
          throw new Error('Failed to update profile');
        }

        return {
          success: true,
          data: {
            success: true,
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

export type AppRouter = typeof appRouter;
export { appRouter };

const app = express();
const PORT = env.PORT;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
    credentials: true,
  })
);

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// tRPC middleware
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔗 tRPC endpoint: http://localhost:${PORT}/trpc`);
});
