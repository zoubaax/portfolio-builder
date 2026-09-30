import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.js';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(
          res,
          'VALIDATION_ERROR',
          'Request body failed validation schema',
          400,
          error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        );
      }
      return sendError(res, 'BAD_REQUEST', 'Invalid request body', 400);
    }
  };
};
