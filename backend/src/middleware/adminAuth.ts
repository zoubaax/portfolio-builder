import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { sendError } from '../utils/response.js';

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only accept admin credentials via HTTP headers (prevent proxy/log leakage of query params)
  const authHeader = req.headers['authorization'];
  const bearerKey = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const adminKey = (req.headers['x-admin-key'] as string) || bearerKey;
  const configuredSecret = process.env.ADMIN_SECRET_KEY;

  if (!configuredSecret || !adminKey) {
    return sendError(
      res,
      'UNAUTHORIZED_ADMIN',
      'Accès refusé. Clé secrète administrateur invalide ou non configurée.',
      401
    );
  }

  // Constant-time comparison to prevent timing side-channel attacks
  const keyBuffer = Buffer.from(adminKey.trim(), 'utf-8');
  const secretBuffer = Buffer.from(configuredSecret.trim(), 'utf-8');

  if (keyBuffer.length !== secretBuffer.length || !crypto.timingSafeEqual(keyBuffer, secretBuffer)) {
    return sendError(
      res,
      'UNAUTHORIZED_ADMIN',
      'Accès refusé. Clé secrète administrateur invalide ou non configurée.',
      401
    );
  }

  next();
};
