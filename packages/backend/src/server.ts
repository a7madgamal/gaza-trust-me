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

// Create context function
const createContext = async (opts: { req: express.Request; res: express.Response }): Promise<Context> => {
  try {
    return await createAuthContext(supabase)(opts);
  } catch {
    // For public endpoints (register, login), return undefined user instead of throwing
    // This allows these endpoints to work without authentication
    logger.info('Error creating context');
    return { user: undefined };
  }
};

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

export { app, PORT };
