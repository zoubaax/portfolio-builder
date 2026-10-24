/**
 * Extracts and validates the portfolio user subdomain from the current hostname.
 *
 * Supported formats:
 * - Production: "username.yourdomain.com" -> "username"
 * - Local Dev:  "username.localhost" -> "username"
 * - Local Dev:  "username.lvh.me" -> "username"
 *
 * Excluded system subdomains:
 * - "www", "app", "api", "admin", "preview", "dev" -> returns null
 */
export function getSubdomain(hostname = window.location?.hostname) {
  if (!hostname || typeof hostname !== 'string') return null;

  const cleanHost = hostname.toLowerCase().trim().split(':')[0]; // strip port if any

  // 1. Localhost development patterns (e.g., alex.localhost, alex.lvh.me)
  if (cleanHost.includes('localhost') || cleanHost.includes('lvh.me')) {
    const parts = cleanHost.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== 'www') {
      return parts[0];
    }
    return null;
  }

  // 2. Vercel deployment domains (*.vercel.app)
  if (cleanHost.endsWith('.vercel.app')) {
    const parts = cleanHost.split('.');
    // Standard app: <app-name>.vercel.app (3 parts) -> null
    // Custom user subdomain on vercel: <user>.<app-name>.vercel.app (4+ parts) -> <user>
    if (parts.length >= 4) {
      const sub = parts[0];
      const systemSubdomains = ['www', 'app', 'api', 'admin', 'preview', 'dev', 'staging'];
      if (!systemSubdomains.includes(sub)) {
        return sub;
      }
    }
    return null;
  }

  // 3. Production custom domain patterns (e.g., alex.yourdomain.com)
  const parts = cleanHost.split('.');
  // Standard domain format: <subdomain>.<domain>.<tld> (at least 3 parts)
  if (parts.length >= 3) {
    const sub = parts[0];
    const systemSubdomains = ['www', 'app', 'api', 'admin', 'preview', 'dev', 'staging'];
    if (systemSubdomains.includes(sub)) {
      return null;
    }
    return sub;
  }

  return null;
}
