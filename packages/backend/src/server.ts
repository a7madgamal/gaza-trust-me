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
