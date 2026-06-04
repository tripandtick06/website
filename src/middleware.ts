import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { ADMIN_COOKIE_NAME, verifyAdminCookieValue } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limit";

const intlMiddleware = createIntlMiddleware(routing);

const RATE_LIMIT_MAX = 10; // requests / window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 dakika
// Admin login: 5 deneme / 15 dakika / IP (brute-force koruma)
const ADMIN_AUTH_MAX = 5;
const ADMIN_AUTH_WINDOW_MS = 15 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Non-API + non-admin paths → next-intl locale routing.
  // /admin/* is TR-only (no locale prefix), bypass intl.
  if (!pathname.startsWith("/api/")) {
    if (pathname.startsWith("/admin")) {
      // /admin/login serbest — login page accessible olmali.
      if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
        return NextResponse.next();
      }
      const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      if (!verifyAdminCookieValue(cookie)) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/login";
        url.search = "";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }
    // next-intl emits 307 (temporary) for locale redirects. KEEP them temporary:
    // root "/" redirects are per-user (Accept-Language / NEXT_LOCALE cookie based).
    // Upgrading to 308 (permanent) makes browsers + shared caches pin the first
    // detected locale forever, breaking device-language auto-detection. So pass
    // next-intl's response through unchanged.
    return intlMiddleware(req);
  }

  // Stripe webhook bypass — Stripe IP'lerinden gelir, signature verify yeterli koruma.
  // Rate-limit Stripe retry mantigini bozar.
  if (pathname.startsWith("/api/stripe/webhook")) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);

  // Admin login: tek IP'den 5 deneme / 15 dakika cap.
  // Brute-force koruma (general 10/dk yetersiz attacker icin).
  if (pathname.startsWith("/api/admin/auth")) {
    const rl = await checkRateLimit(`${ip}:admin-auth`, ADMIN_AUTH_MAX, ADMIN_AUTH_WINDOW_MS);
    if (!rl.ok) {
      return new NextResponse(
        JSON.stringify({
          error: "Cok fazla deneme. 15 dakika sonra tekrar deneyin.",
          retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(ADMIN_AUTH_MAX),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", String(ADMIN_AUTH_MAX));
    res.headers.set("X-RateLimit-Remaining", String(rl.remaining));
    return res;
  }

  // Rate-limit /api/seo-agent + /api/checkout + /api/contact + /api/availability + /api/cancel + /api/b2b
  const rateLimited =
    pathname.startsWith("/api/seo-agent") ||
    pathname.startsWith("/api/checkout") ||
    pathname.startsWith("/api/contact") ||
    pathname.startsWith("/api/availability") ||
    pathname.startsWith("/api/cancel") ||
    pathname.startsWith("/api/b2b");

  if (rateLimited) {
    const rl = await checkRateLimit(`${ip}:${pathname}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rl.ok) {
      return new NextResponse(
        JSON.stringify({
          error: "Cok fazla istek. Lutfen biraz sonra tekrar deneyin.",
          retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX));
    res.headers.set("X-RateLimit-Remaining", String(rl.remaining));
    return res;
  }

  return NextResponse.next();
}

export const config = {
  // API rate-limit + non-API locale routing.
  // Exclude: _next, _vercel, static files (with extension).
  matcher: [
    "/api/:path*",
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
