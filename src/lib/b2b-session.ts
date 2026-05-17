// B2B acente session token — HMAC-SHA256 imzali opaque cookie value.
//
// Importers:
//   - src/app/api/b2b/auth/login/route.ts (sign on success)
//   - src/app/api/b2b/auth/me/route.ts (verify cookie)
//   - src/app/api/b2b/auth/logout/route.ts (cookie clear)
// Format: <base64url(agencyId)>.<base64url(HMAC-SHA256(agencyId, secret))>
// Secret: env B2B_SESSION_SECRET → fallback ADMIN_API_TOKEN.
// Cookie: tripandtick_b2b, httpOnly + Secure (prod) + SameSite=Strict + Max-Age=24h.

export const B2B_COOKIE_NAME = "tripandtick_b2b";
export const B2B_COOKIE_MAX_AGE = 60 * 60 * 24; // 24 saat (saniye)

function getSecret(): string {
  return (
    process.env.B2B_SESSION_SECRET ||
    process.env.ADMIN_API_TOKEN ||
    "" // bos secret → verify her zaman false (production'da konfigurasyon hatasi)
  );
}

function toBase64Url(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacSign(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return toBase64Url(new Uint8Array(sig));
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signB2BSession(agencyId: string): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error("B2B_SESSION_SECRET veya ADMIN_API_TOKEN env eksik");
  const payloadB64 = toBase64Url(new TextEncoder().encode(agencyId));
  const sig = await hmacSign(agencyId, secret);
  return `${payloadB64}.${sig}`;
}

export async function verifyB2BSession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const secret = getSecret();
  if (!secret) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  let agencyId: string;
  try {
    agencyId = new TextDecoder().decode(fromBase64Url(parts[0]));
  } catch {
    return null;
  }
  const expectedSig = await hmacSign(agencyId, secret);
  if (!timingSafeEqualStr(parts[1], expectedSig)) return null;
  return agencyId;
}
