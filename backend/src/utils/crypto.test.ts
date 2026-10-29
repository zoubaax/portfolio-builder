import { describe, it, expect } from 'vitest';
import {
  encryptSecret,
  decryptSecret,
  createOAuthState,
  verifyOAuthState,
  escapeHtml,
} from './crypto.js';

describe('Crypto & Security Utilities', () => {
  it('encrypts and decrypts secret strings with AES-256-GCM', () => {
    const originalToken = 'gho_1234567890abcdefghijklmnopqrstuvwxyz';
    const encrypted = encryptSecret(originalToken);

    expect(encrypted).not.toBe(originalToken);
    expect(encrypted.startsWith('enc:')).toBe(true);

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(originalToken);
  });

  it('decryptSecret handles legacy plaintext strings backwards-compatibly', () => {
    const legacyPlaintext = 'plain_old_token_123';
    expect(decryptSecret(legacyPlaintext)).toBe(legacyPlaintext);
  });

  it('creates and verifies cryptographically signed OAuth state', () => {
    const state = createOAuthState('user_2xyz');
    expect(state).toContain('.');

    const verified = verifyOAuthState(state);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe('user_2xyz');
  });

  it('rejects tampered OAuth state tokens', () => {
    const state = createOAuthState('user_2xyz');
    const [payload, sig] = state.split('.');
    const tampered = `${payload}.${sig.replace(/^[0-9a-f]/, '9')}`;

    expect(verifyOAuthState(tampered)).toBeNull();
  });

  it('escapes dangerous HTML characters', () => {
    expect(escapeHtml('<script>alert("XSS & \'")</script>')).toBe(
      '&lt;script&gt;alert(&quot;XSS &amp; &#39;&quot;)&lt;/script&gt;'
    );
  });
});

