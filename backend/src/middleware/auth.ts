import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware to verify Supabase JWT tokens
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify the JWT using Supabase JWT secret
      const secret = new TextEncoder().encode(config.supabase.jwtSecret);
      
      const { payload } = await jose.jwtVerify(token, secret, {
        issuer: config.supabase.url + '/auth/v1',
        audience: 'authenticated',
      });

      // Extract user information from JWT payload
      const userId = payload.sub;
      const email = payload.email as string | undefined;

      if (!userId) {
        res.status(401).json({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token does not contain user ID',
          },
        });
        return;
      }

      // Attach user to request
      (req as AuthenticatedRequest).user = {
        userId,
        email: email || '',
      };

      logger.debug({ userId }, 'User authenticated');
      next();
    } catch (jwtError) {
      logger.warn({ err: jwtError }, 'JWT verification failed');
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
      return;
    }
  } catch (error) {
    logger.error({ err: error }, 'Authentication middleware error');
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed',
      },
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  // If there is a token, validate it
  await authenticate(req, res, next);
};

