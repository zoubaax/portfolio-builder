import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { sendError } from '../utils/response.js';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
  };
}

/**
 * Clerk Authentication Verification Middleware
 * Extracts authenticated userId from Clerk session or development fallback
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // 1. Check for real Clerk authentication session
  try {
    const auth = getAuth(req);
    if (auth && auth.userId) {
      req.auth = { userId: auth.userId };
      return next();
    }
  } catch (err) {
    // If getAuth throws or clerkMiddleware is not available, proceed to fallback check below
  }

  // 2. Development & Testing Fallback
  // Allows testing when explicitly in development mode and no Clerk token is sent
  const devMockHeader = req.headers['x-user-id'] as string;
  if (process.env.NODE_ENV === 'development') {
    const fallbackId = devMockHeader || 'dev_user_zoubaa';
    req.auth = { userId: fallbackId };
    return next();
  }

  return sendError(res, 'UNAUTHORIZED', 'Authentication session required', 401);
};
