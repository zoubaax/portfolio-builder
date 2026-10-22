import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { requireAuth, AuthenticatedRequest } from './auth.js';
import { Response, NextFunction } from 'express';
import * as clerkExpress from '@clerk/express';

// Mock Clerk getAuth
vi.mock('@clerk/express', () => ({
  getAuth: vi.fn(),
}));

describe('Auth Middleware: requireAuth', () => {
  const originalEnv = process.env.NODE_ENV;

  const createMocks = (headers: Record<string, string> = {}) => {
    const req = { headers } as unknown as AuthenticatedRequest;
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    const next = vi.fn() as NextFunction;
    return { req, res: res as Response, next };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('authenticates user and calls next() when valid Clerk session exists', () => {
    vi.mocked(clerkExpress.getAuth).mockReturnValue({ userId: 'user_clerk_123' } as any);
    const { req, res, next } = createMocks();

    requireAuth(req, res, next);

    expect(req.auth?.userId).toBe('user_clerk_123');
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('uses development fallback when in development environment without token', () => {
    vi.mocked(clerkExpress.getAuth).mockReturnValue(null as any);
    process.env.NODE_ENV = 'development';
    const { req, res, next } = createMocks({ 'x-user-id': 'custom_dev_user' });

    requireAuth(req, res, next);

    expect(req.auth?.userId).toBe('custom_dev_user');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects request with 401 UNAUTHORIZED in production when no session exists', () => {
    vi.mocked(clerkExpress.getAuth).mockReturnValue(null as any);
    process.env.NODE_ENV = 'production';
    const { req, res, next } = createMocks();

    requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      })
    );
  });
});
