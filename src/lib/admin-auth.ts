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
