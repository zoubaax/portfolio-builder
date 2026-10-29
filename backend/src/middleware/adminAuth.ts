import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = (req.headers['x-admin-key'] as string) || (req.query.key as string);
  const configuredSecret = process.env.ADMIN_SECRET_KEY;

  if (!configuredSecret || !adminKey || adminKey.trim() !== configuredSecret.trim()) {
    return sendError(
      res,
      'UNAUTHORIZED_ADMIN',
      'Accès refusé. Clé secrète administrateur invalide ou non configurée.',
      401
    );
  }

  next();
};
