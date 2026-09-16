// Cloudflare Workers entrypoint - static assets + security headers.
// Runs before asset serving (assets.run_worker_first in wrangler.jsonc):
// every response gets hardened headers, hashed /assets/* files get
// immutable caching, and SPA routing is handled by the assets binding.

interface Env {
  STATIC_ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://*.convex.cloud wss://*.convex.cloud",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; "),
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.STATIC_ASSETS.fetch(request);

    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      headers.set(key, value);
    }

    // Vite emits content-hashed files under /assets/ - safe to cache forever
    if (new URL(request.url).pathname.startsWith("/assets/")) {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
