import { describe, it, expect, vi } from 'vitest';
import { validateBody } from './validate.js';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

describe('validateBody middleware', () => {
  const schema = z.object({
    title: z.string().min(3),
    slug: z.string().regex(/^[a-z0-9-]+$/),
  });

  const createMocks = (body: any) => {
    const req = { body } as Request;
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    const next = vi.fn() as NextFunction;
    return { req, res: res as Response, next };
  };

  it('calls next() when body conforms to schema', () => {
    const { req, res, next } = createMocks({
      title: 'Valid Portfolio',
      slug: 'valid-portfolio',
    });

    validateBody(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 with VALIDATION_ERROR and field details when body is invalid', () => {
    const { req, res, next } = createMocks({
      title: 'Hi', // too short (< 3)
      slug: 'INVALID SLUG!',
    });

    validateBody(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
        }),
      })
    );
  });
});
