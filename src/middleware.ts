import { NextResponse, type NextRequest } from "next/server";

// In-memory rate limiter (Faz 2: Upstash Redis)
const RATE_LIMIT_MAX = 10; // requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 dakika
const buckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

function rateLimit(key: string, max = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: max - 1, resetAt };
  }
  bucket.count += 1;
  if (bucket.count > max) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }
  return { ok: true, remaining: max - bucket.count, resetAt: bucket.resetAt };
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);

  // Rate-limit /api/seo-agent + /api/checkout + /api/contact
  const rateLimited =
    pathname.startsWith("/api/seo-agent") ||
    pathname.startsWith("/api/checkout") ||
    pathname.startsWith("/api/contact");

  if (rateLimited) {
    const rl = rateLimit(`${ip}:${pathname}`);
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
  matcher: ["/api/:path*"],
};
