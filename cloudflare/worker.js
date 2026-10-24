/**
 * Portfolify Cloudflare Edge Routing Worker
 * Intercepts *.portfolify.tech traffic and reverse proxies to Vercel
 * while preserving the visitor's subdomain for multi-tenant rendering.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();

    // 1. The Vercel deployment target
    const VERCEL_ORIGIN = "portfoliobuilder-omega.vercel.app";

    // 2. Reserved system subdomains that route directly to main studio
    const SYSTEM_SUBDOMAINS = ["www", "app", "api", "admin", "dev", "preview", "staging"];

    // 3. Extract tenant slug (e.g., "alex" from "alex.portfolify.tech")
    const parts = hostname.split(".");
    const isTenantSubdomain = parts.length >= 3 && !SYSTEM_SUBDOMAINS.includes(parts[0]);
    const tenantSlug = isTenantSubdomain ? parts[0] : null;

    // 4. Construct origin request URL
    const originUrl = new URL(request.url);
    originUrl.hostname = VERCEL_ORIGIN;
    originUrl.protocol = "https:";
    originUrl.port = "";

    // 5. Clone and enrich request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("Host", VERCEL_ORIGIN);
    requestHeaders.set("X-Forwarded-Host", hostname);
    requestHeaders.set("X-Original-Host", hostname);
    if (tenantSlug) {
      requestHeaders.set("X-Portfolify-Subdomain", tenantSlug);
    }

    // 6. Fetch from Vercel Edge with manual redirect preservation
    const fetchOptions = {
      method: request.method,
      headers: requestHeaders,
      redirect: "manual",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchOptions.body = request.body;
    }

    try {
      const response = await fetch(originUrl.toString(), fetchOptions);

      // Return response with CORS allowance
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(`Cloudflare Gateway Error: ${err.message}`, { status: 502 });
    }
  },
};
