// Shared admin-auth constants + cookie verifier.
//
// Importers:
//   - src/middleware.ts (path /admin/* protect)
//   - src/app/api/admin/auth/route.ts (Set-Cookie on login)
//   - src/app/api/admin/logout/route.ts (Set-Cookie max-age=0)
// Cookie: tripandtick_admin = ADMIN_API_TOKEN (httpOnly + Secure + SameSite=Strict + Path=/ + 24h).

export const ADMIN_COOKIE_NAME = "tripandtick_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 saat (saniye)

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Cookie value ile ADMIN_API_TOKEN env constant-time compare.
 * Cookie yoksa veya env yoksa false.
 */
export function verifyAdminCookieValue(value: string | undefined): boolean {
  if (!value) return false;
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) return false;
  return timingSafeEqualStr(value, expected);
}

/**
 * Admin API istekleri için tek kapı (2026-09-19). Kabul:
 *   (a) httpOnly admin cookie (admin UI same-origin fetch'i otomatik taşır), veya
 *   (b) `x-admin-token` header = ADMIN_API_TOKEN (AGA/cron/script).
 * `demo-` kısayolu YALNIZ non-production: eski `isAdmin()` kopyaları prod'da
 * `ADMIN_TOKEN` env tanımsız olduğu için `demo-*` header'ı olan herkesi admin sayıyordu
 * (kupon/yorum/müsaitlik yazma). Bu helper o dört kopyanın yerine geçer.
 */
export function isAdminRequest(req: {
  headers: { get(name: string): string | null };
  cookies?: { get(name: string): { value: string } | undefined };
}): boolean {
  const cookie = req.cookies?.get(ADMIN_COOKIE_NAME)?.value;
  if (verifyAdminCookieValue(cookie)) return true;
  const header = req.headers.get("x-admin-token") ?? undefined;
  if (verifyAdminCookieValue(header)) return true;
  // Eski `ADMIN_TOKEN` env'i tanımlıysa onu da kabul et (geriye dönük).
  const legacy = process.env.ADMIN_TOKEN;
  if (legacy && header && timingSafeEqualStr(header, legacy)) return true;
  if (process.env.NODE_ENV !== "production" && header?.startsWith("demo-")) return true;
  return false;
}
