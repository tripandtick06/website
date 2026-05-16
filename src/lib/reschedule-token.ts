// Reschedule magic-link token — HMAC-SHA256 stateless verify (WebCrypto, edge).
//
// Importers (callers):
//   - src/app/api/admin/reschedule/route.ts (sign)
//   - src/app/api/rezervasyon/yeniden-tarih/route.ts (verify + consume)
//   - src/app/[locale]/rezervasyon/yeniden-tarih/[token]/page.tsx (verify-only)
// Payload: bookingId | originalDate | originalSlug | exp(ISO) | nonce
//          → base64url(json) + "." + base64url(hmac)
// Secret: RESCHEDULE_SECRET env (fallback ADMIN_API_TOKEN). Default-TTL: 14 gun.

const DEFAULT_TTL_DAYS = 14;

export interface RescheduleTokenPayload {
  bookingId: string;
  originalDate: string;
  originalSlug: string;
  exp: string; // ISO
  nonce: string;
}

function secret(): string {
  const s = process.env.RESCHEDULE_SECRET ?? process.env.ADMIN_API_TOKEN;
  if (!s || s.length < 8) {
    return "demo-reschedule-secret-rotate-me-32bytes-min";
  }
  return s;
}

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function fromUtf8(buf: Uint8Array): string {
  return new TextDecoder().decode(buf);
}

async function hmac(key: string, data: string): Promise<Uint8Array> {
  const keyBytes = utf8(key);
  const dataBytes = utf8(data);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    dataBytes.buffer.slice(dataBytes.byteOffset, dataBytes.byteOffset + dataBytes.byteLength) as ArrayBuffer
  );
  return new Uint8Array(sig);
}

function constantTimeEq(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function randomNonce(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return b64urlEncode(bytes);
}

export async function signRescheduleToken(opts: {
  bookingId: string;
  originalDate: string;
  originalSlug: string;
  ttlDays?: number;
}): Promise<string> {
  const exp = new Date();
  exp.setUTCDate(exp.getUTCDate() + (opts.ttlDays ?? DEFAULT_TTL_DAYS));
  const payload: RescheduleTokenPayload = {
    bookingId: opts.bookingId,
    originalDate: opts.originalDate,
    originalSlug: opts.originalSlug,
    exp: exp.toISOString(),
    nonce: randomNonce(),
  };
  const json = JSON.stringify(payload);
  const payloadB64 = b64urlEncode(utf8(json));
  const sig = await hmac(secret(), payloadB64);
  const sigB64 = b64urlEncode(sig);
  return `${payloadB64}.${sigB64}`;
}

export interface VerifyResult {
  valid: boolean;
  payload?: RescheduleTokenPayload;
  error?: "format" | "signature" | "expired" | "decode";
}

export async function verifyRescheduleToken(token: string): Promise<VerifyResult> {
  if (!token || !token.includes(".")) return { valid: false, error: "format" };
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return { valid: false, error: "format" };

  let expectedSig: Uint8Array;
  try {
    expectedSig = await hmac(secret(), payloadB64);
  } catch {
    return { valid: false, error: "signature" };
  }
  let givenSig: Uint8Array;
  try {
    givenSig = b64urlDecode(sigB64);
  } catch {
    return { valid: false, error: "decode" };
  }
  if (!constantTimeEq(expectedSig, givenSig)) {
    return { valid: false, error: "signature" };
  }

  let payload: RescheduleTokenPayload;
  try {
    const json = fromUtf8(b64urlDecode(payloadB64));
    payload = JSON.parse(json) as RescheduleTokenPayload;
  } catch {
    return { valid: false, error: "decode" };
  }

  if (!payload.exp || new Date(payload.exp).getTime() < Date.now()) {
    return { valid: false, payload, error: "expired" };
  }
  return { valid: true, payload };
}
