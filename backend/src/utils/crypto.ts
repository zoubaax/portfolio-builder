import crypto from 'crypto';

const RAW_KEY = process.env.ENCRYPTION_SECRET_KEY || process.env.ADMIN_SECRET_KEY || process.env.CLERK_SECRET_KEY || 'portfolify-32-byte-default-encryption-secret!';
const DERIVED_KEY = crypto.createHash('sha256').update(RAW_KEY).digest();

/**
 * Encrypts a sensitive string (e.g. GitHub OAuth Access Token or BYOK API Key) using AES-256-GCM
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return plainText;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', DERIVED_KEY, iv);
  let encrypted = cipher.update(plainText, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `enc:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * Backward compatible: if string does not start with 'enc:', returns as-is.
 */
export function decryptSecret(cipherText: string | null | undefined): string | null {
  if (!cipherText) return null;
  if (!cipherText.startsWith('enc:')) {
    return cipherText; // Existing plaintext record
  }

  try {
    const parts = cipherText.split(':');
    if (parts.length !== 4) return cipherText;
    const [, ivHex, authTagHex, encrypted] = parts;
    const decipher = crypto.createDecipheriv('aes-256-gcm', DERIVED_KEY, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  } catch (err) {
    console.warn('[decryptSecret] Decryption failure:', err);
    return null;
  }
}

/**
 * Creates a cryptographically signed OAuth state string to prevent OAuth 2.0 CSRF attacks
 */
export function createOAuthState(userId: string): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const payload = JSON.stringify({ userId, nonce, timestamp });
  const b64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', DERIVED_KEY).update(b64Payload).digest('hex');
  return `${b64Payload}.${signature}`;
}

/**
 * Verifies an OAuth state string and returns the authenticated userId if valid and not expired (15m)
 */
export function verifyOAuthState(stateStr: string | null | undefined): { userId: string } | null {
  if (!stateStr || !stateStr.includes('.')) return null;
  const [b64Payload, signature] = stateStr.split('.');
  if (!b64Payload || !signature) return null;

  const expectedSig = crypto.createHmac('sha256', DERIVED_KEY).update(b64Payload).digest('hex');
  const sigBuffer = Buffer.from(signature, 'utf-8');
  const expBuffer = Buffer.from(expectedSig, 'utf-8');

  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(b64Payload, 'base64url').toString('utf-8');
    const parsed = JSON.parse(jsonStr);
    // Expire state after 15 minutes
    if (Date.now() - parsed.timestamp > 15 * 60 * 1000) {
      return null;
    }
    return { userId: parsed.userId };
  } catch {
    return null;
  }
}

/**
 * Escapes characters dangerous in HTML contexts to prevent Reflected/DOM XSS
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

