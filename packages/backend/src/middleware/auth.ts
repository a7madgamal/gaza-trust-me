import { Request, Response, NextFunction } from 'express';
import { TRPCError } from '@trpc/server';
import type winston from 'winston';

import type { User } from '../types';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: Pick<User, 'id' | 'email' | 'role'>;
}

export const authenticateUser = (logger: winston.Logger, supabase: typeof import('../utils/supabase').supabase) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const token = authHeader.substring(7);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      // Get user role from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      if (!user.email) {
        res.status(401).json({ error: 'User email not found' });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: userData.role,
      };

      next();
    } catch (error) {
      logger.error('Authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  };
};

export const requireRole = (allowedRoles: ('help_seeker' | 'admin' | 'super_admin')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin', 'super_admin']);
export const requireSuperAdmin = requireRole(['super_admin']);

// tRPC middleware for authentication
export const createAuthContext = (supabase: typeof import('../utils/supabase').supabase) => {
  return async (opts: { req: Request; res: Response }) => {
    const authHeader = opts.req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No token provided' });
    }

    const token = authHeader.substring(7);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
    }

    // Get user role from database
    logger.info(`Looking for user with ID: ${user.id}`);
    const { data: userData, error: userError } = await supabase.from('users').select('role').eq('id', user.id).single();

    if (userError) {
      logger.error('User role lookup error:', userError);

      // Debug: Check if user exists at all
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', user.id);

      if (allUsersError) {
        logger.error('Error checking all users:', allUsersError);
      } else {
        logger.info('Users found with this ID:', allUsers);
      }

      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: `User role lookup failed: ${userError.message}`,
      });
    }

    if (!userData) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
    }

    if (!user.email) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User email not found' });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: userData.role,
      },
    };
  };
};
