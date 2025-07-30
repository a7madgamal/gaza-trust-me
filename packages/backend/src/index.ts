import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { ApiResponseSchema } from './schemas/api';
import { UserRegistrationSchema, UserLoginSchema } from './schemas/user';
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

// Load environment variables
dotenv.config();

// Initialize tRPC with context
const t = initTRPC.context<Context>().create();

// Create context function
const createContext = async (opts: { req: express.Request; res: express.Response }): Promise<Context> => {
  try {
    return await createAuthContext(opts);
  } catch {
    return {};
  }
};

// Basic router with proper types
const appRouter = t.router({
  hello: t.procedure
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
  register: t.procedure
    .input(UserRegistrationSchema)
    .output(ApiResponseSchema(z.object({ userId: z.string() })))
    .mutation(async ({ input }) => {
      try {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
        });

        if (authError) {
          throw new Error(authError.message);
        }

        if (!authData.user) {
          throw new Error('Failed to create user');
        }

        // Create user profile in database
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: input.email,
          full_name: input.fullName,
          phone_number: input.phoneNumber,
          role: 'help_seeker',
        });

        if (profileError) {
          // Clean up auth user if profile creation fails
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error('Failed to create user profile');
        }

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

  login: t.procedure
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
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData) {
          throw new Error('User profile not found');
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

  logout: t.procedure.output(ApiResponseSchema(z.object({ success: z.boolean() }))).mutation(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }

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

  getProfile: t.procedure
    .output(
      ApiResponseSchema(
        z.object({
          id: z.string(),
          email: z.string(),
          fullName: z.string(),
          phoneNumber: z.string().optional(),
          role: z.string(),
        })
      )
    )
    .query(async ({ ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error('Not authenticated');
        }

        // Get user profile from database
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, email, full_name, phone_number, role')
          .eq('id', ctx.user.id)
          .single();

        if (error || !userData) {
          throw new Error('User profile not found');
        }

        return {
          success: true,
          data: {
            id: userData.id,
            email: userData.email,
            fullName: userData.full_name,
            phoneNumber: userData.phone_number,
            role: userData.role,
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
});

export type AppRouter = typeof appRouter;

const app = express();
const PORT = process.env['PORT'] || 3001;

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
