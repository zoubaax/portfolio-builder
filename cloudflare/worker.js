/**
 * Portfolify Cloudflare Edge Routing Worker
 * Intercepts *.portfolify.tech traffic and reverse proxies to Vercel
 * while preserving the visitor's subdomain for multi-tenant rendering.
 */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

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

    // Forward client-side SPA routes (/admin, /studio, /onboarding, /preview/...)
    // to "/" so Vercel serves index.html to allow React Router to mount client-side
    const isApiRequest = url.pathname.startsWith("/api");
    const isStaticAsset = url.pathname.includes(".");
    if (!isApiRequest && !isStaticAsset && url.pathname !== "/") {
      originUrl.pathname = "/";
    }

    // 5. Clone and enrich request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("Host", VERCEL_ORIGIN);
    requestHeaders.set("X-Forwarded-Host", hostname);
    requestHeaders.set("X-Original-Host", hostname);
    if (tenantSlug) {
      requestHeaders.set("X-Portfolify-Subdomain", tenantSlug);
    }

    // 6. Fetch options
    const fetchOptions = {
      method: request.method,
      headers: requestHeaders,
      redirect: "manual",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchOptions.body = request.body;
    }

    try {
      let response = await fetch(originUrl.toString(), fetchOptions);

      // SPA Fallback: If origin returns 404 for a client-side navigation route
      // (not an API call and not a static asset with a file extension like .js, .css, .png, etc.)
      if (response.status === 404 && !url.pathname.startsWith('/api') && !url.pathname.includes('.')) {
        const spaUrl = new URL(originUrl.toString());
        spaUrl.pathname = '/';
        const spaRes = await fetch(spaUrl.toString(), fetchOptions);
        if (spaRes.ok) {
          response = spaRes;
        }
      }

      const contentType = response.headers.get("content-type") || "";
      const isHtmlRequest = contentType.includes("text/html") && (url.pathname === "/" || url.pathname === "");

      // If not a tenant subdomain or not the root HTML page, return response directly
      if (!tenantSlug || !isHtmlRequest) {
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      }

      // 7. Dynamic Open Graph Enrichment for WhatsApp, LinkedIn, Twitter, iMessage previews
      let ogTitle = `${tenantSlug} — Portfolio`;
      let ogDesc = `Découvrez le portfolio professionnel de ${tenantSlug} sur Portfolify.`;
      let ogImage = `https://${hostname}/favicon.svg`;

      try {
        const metaRes = await fetch(`https://${VERCEL_ORIGIN}/api/v1/portfolios/public/${tenantSlug}`, {
          headers: { "Host": VERCEL_ORIGIN },
        });
        if (metaRes.ok) {
          const json = await metaRes.json();
          const schema = json?.data?.schemaData || {};
          const hero = schema.sections?.find((s) => s.type === "hero")?.data || {};
          const userName = hero.name || tenantSlug;
          const userTitle = hero.title || "Portfolio";
          ogTitle = `${userName} — ${userTitle}`;
          ogDesc = hero.tagline || hero.bio || schema.meta?.description || ogDesc;
          if (hero.avatar && typeof hero.avatar === "string" && hero.avatar.startsWith("http")) {
            ogImage = hero.avatar;
            // Resolve 301/302 redirects (e.g. github.com/*.png -> avatars.githubusercontent.com)
            // WhatsApp crawler strictly drops images that respond with redirects!
            try {
              const imgCheck = await fetch(ogImage, { method: "HEAD", redirect: "follow" });
              if (imgCheck.ok && imgCheck.url) {
                ogImage = imgCheck.url;
              }
            } catch (imgErr) {
              // Keep original if check fails
            }
          }
        }
      } catch (metaErr) {
        // Fallback gracefully
      }

      const escapedTitle = escapeHtml(ogTitle);
      const escapedDesc = escapeHtml(ogDesc);
      const escapedImage = escapeHtml(ogImage);
      const canonicalUrl = `https://${hostname}/`;

      const rewriter = new HTMLRewriter()
        .on("title", {
          element(el) {
            el.setInnerContent(ogTitle);
          },
        })
        .on("head", {
          element(el) {
            el.prepend(`
  <!-- Dynamic Open Graph / WhatsApp Preview Meta Tags -->
  <meta name="description" content="${escapedDesc}">
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapedTitle}">
  <meta property="og:description" content="${escapedDesc}">
  <meta property="og:image" content="${escapedImage}">
  <meta property="og:image:secure_url" content="${escapedImage}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="400">
  <meta property="og:image:height" content="400">
  <meta property="og:image:alt" content="${escapedTitle}">
  <meta property="og:site_name" content="Portfolify">
  <meta itemprop="name" content="${escapedTitle}">
  <meta itemprop="description" content="${escapedDesc}">
  <meta itemprop="image" content="${escapedImage}">
  <link rel="image_src" href="${escapedImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapedTitle}">
  <meta name="twitter:description" content="${escapedDesc}">
  <meta name="twitter:image" content="${escapedImage}">
            `, { html: true });
          },
        });

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

      return rewriter.transform(
        new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        })
      );
    } catch (err) {
      return new Response(`Cloudflare Gateway Error: ${err.message}`, { status: 502 });
    }
  },
};

