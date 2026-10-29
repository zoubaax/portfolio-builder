import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { adminAuthMiddleware } from './adminAuth.js';
import { Request, Response, NextFunction } from 'express';

describe('Admin Auth Middleware', () => {
  const originalSecret = process.env.ADMIN_SECRET_KEY;

  const createMocks = (headers: Record<string, string> = {}, query: Record<string, string> = {}) => {
    const req = { headers, query } as unknown as Request;
    const res: Partial<Response> = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    const next = vi.fn() as NextFunction;
    return { req, res: res as Response, next };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_SECRET_KEY = 'super_secure_admin_secret_test';
  });

  afterEach(() => {
    process.env.ADMIN_SECRET_KEY = originalSecret;
  });

  it('allows access with valid x-admin-key header', () => {
    const { req, res, next } = createMocks({ 'x-admin-key': 'super_secure_admin_secret_test' });

    adminAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('allows access with valid Authorization Bearer header', () => {
    const { req, res, next } = createMocks({ authorization: 'Bearer super_secure_admin_secret_test' });

    adminAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects access when key is passed solely via query string (disallowed for security)', () => {
    const { req, res, next } = createMocks({}, { key: 'super_secure_admin_secret_test' });

    adminAuthMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects access when admin key is incorrect', () => {
    const { req, res, next } = createMocks({ 'x-admin-key': 'wrong_secret_key' });

    adminAuthMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects access when ADMIN_SECRET_KEY is not configured', () => {
    delete process.env.ADMIN_SECRET_KEY;
    const { req, res, next } = createMocks({ 'x-admin-key': 'some_key' });

    adminAuthMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

