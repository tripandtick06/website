// Guvenlik basliklari (2026-11-06 audit). next.config.js headers() Cloudflare
// next-on-pages altinda edge/middleware route'larina UYGULANMIYOR (canli: 0/5),
// bu yuzden middleware her yanita buradan ekler. CSP simdilik Report-Only.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://api.stripe.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "frame-ancestors 'self'",
].join("; ");

export const SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ["Strict-Transport-Security", "max-age=31536000"],
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "SAMEORIGIN"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(self), payment=(self)"],
  ["Content-Security-Policy-Report-Only", CSP],
];

export function withSecurityHeaders<T extends { headers: Headers }>(res: T): T {
  for (const [k, v] of SECURITY_HEADERS) {
    if (!res.headers.has(k)) res.headers.set(k, v);
  }
  return res;
}
