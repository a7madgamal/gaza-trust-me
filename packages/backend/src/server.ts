import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { env } from './utils/env';
import logger from './utils/logger';
import { createAuthContext } from './middleware/auth';
import { supabase } from './utils/supabase';
import { appRouter } from './routers';
import type { Context } from './routers/shared';

const app = express();
const PORT = env.PORT;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env['FRONTEND_URL'],
    credentials: true,
  })
);

// Compression
app.use(compression());

// Rate limiting (production only)
if (env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create context function
const createContext = async (opts: { req: express.Request; res: express.Response }): Promise<Context> => {
  const authHeader = opts.req.headers.authorization;

  // If no auth header, return undefined user (for public endpoints)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: undefined };
  }

  // If auth header exists, validate it (will throw for invalid tokens)
  return await createAuthContext(supabase)(opts);
};

// Auth callback REST endpoint (for browser redirects)
app.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      logger.error('Auth callback missing code parameter');
      return res.status(400).json({ error: 'Missing auth code' });
    }

    logger.info('Processing auth callback with code:', code.substring(0, 10) + '...');

    // Exchange auth code for session using PKCE
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error('PKCE code exchange error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data.user || !data.session) {
      logger.error('Failed to exchange code for session');
      return res.status(400).json({ error: 'Failed to exchange code for session' });
    }

    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, status')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      logger.error('User profile not found. Error:', userError);
      return res.status(400).json({ error: 'User profile not found' });
    }

    logger.info('Auth callback successful for user:', data.user.email);

    // Redirect to frontend with auth data
    const redirectUrl = new URL('/auth/success', env.FRONTEND_URL);

    // Pass auth data as URL parameters (will be handled by frontend)
    redirectUrl.searchParams.set('token', data.session.access_token);
    redirectUrl.searchParams.set(
      'user',
      JSON.stringify({
        id: data.user.id,
        email: data.user.email ?? '',
        role: userData.role,
        status: userData.status,
      })
    );

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    logger.error('Auth callback error:', error);
    const errorUrl = new URL('/auth/error', env.FRONTEND_URL);
    errorUrl.searchParams.set('error', error instanceof Error ? error.message : 'Auth callback failed');
    return res.redirect(errorUrl.toString());
  }
});

// tRPC middleware
app.use(
  '/api/trpc',
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

// 404 handler for unmatched routes
app.use(/(.*)/, (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export { app, PORT };
