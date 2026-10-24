import { describe, it, expect } from 'vitest';
import { getSubdomain } from './subdomain';

describe('getSubdomain Utility', () => {
  it('extracts username from production custom domains', () => {
    expect(getSubdomain('zoubaa.portfolify.dev')).toBe('zoubaa');
    expect(getSubdomain('alex-rivera.myportfolio.com')).toBe('alex-rivera');
  });

  it('ignores standard system subdomains like www, app, and api', () => {
    expect(getSubdomain('www.portfolify.dev')).toBeNull();
    expect(getSubdomain('app.portfolify.dev')).toBeNull();
    expect(getSubdomain('api.portfolify.dev')).toBeNull();
    expect(getSubdomain('dev.portfolify.dev')).toBeNull();
  });

  it('returns null for bare root domains and vercel default domains', () => {
    expect(getSubdomain('portfolify.dev')).toBeNull();
    expect(getSubdomain('localhost')).toBeNull();
    expect(getSubdomain('portfoliobuilder-omega.vercel.app')).toBeNull();
    expect(getSubdomain('portfoliobuilder-8cn0ni35z-zoubaax-8385s-projects.vercel.app')).toBeNull();
    expect(getSubdomain('alex.portfoliobuilder.vercel.app')).toBe('alex');
  });

  it('supports local development multi-tenant subdomains (e.g. lvh.me, localhost)', () => {
    expect(getSubdomain('zoubaa.localhost')).toBe('zoubaa');
    expect(getSubdomain('sarah.lvh.me')).toBe('sarah');
    expect(getSubdomain('zoubaa.localhost:5174')).toBe('zoubaa');
  });

  it('handles null, undefined, and non-string inputs safely', () => {
    expect(getSubdomain(null)).toBeNull();
    expect(getSubdomain(undefined)).toBeNull();
    expect(getSubdomain('')).toBeNull();
  });
});
