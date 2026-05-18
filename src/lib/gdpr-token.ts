// GDPR magic-link token — HMAC-SHA256 stateless verify (WebCrypto, edge).
//
// Importers (callers):
//   - src/app/api/gdpr/request/route.ts (sign — email magic-link)
//   - src/app/api/gdpr/export/route.ts (verify + emit JSON bundle)
//   - src/app/api/gdpr/delete/route.ts (verify + execute erasure)
// Payload: email | action(export|delete) | exp(ISO) | nonce
//          → base64url(json) + "." + base64url(hmac)
// Secret: GDPR_SECRET env (fallback ADMIN_API_TOKEN). Default-TTL: 24 saat.

const DEFAULT_TTL_HOURS = 24;

export type GdprAction = "export" | "delete";

export interface GdprTokenPayload {
  email: string;
  action: GdprAction;
  exp: string;
  nonce: string;
}

function secret(): string {
  const s = process.env.GDPR_SECRET ?? process.env.ADMIN_API_TOKEN;
  if (!s || s.length < 8) {
    return "demo-gdpr-secret-rotate-me-32bytes-minimum";
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

export async function signGdprToken(opts: {
  email: string;
  action: GdprAction;
  ttlHours?: number;
}): Promise<string> {
  const exp = new Date();
  exp.setUTCHours(exp.getUTCHours() + (opts.ttlHours ?? DEFAULT_TTL_HOURS));
  const payload: GdprTokenPayload = {
    email: opts.email.trim().toLowerCase(),
    action: opts.action,
    exp: exp.toISOString(),
    nonce: randomNonce(),
  };
  const json = JSON.stringify(payload);
  const payloadB64 = b64urlEncode(utf8(json));
  const sig = await hmac(secret(), payloadB64);
  const sigB64 = b64urlEncode(sig);
  return `${payloadB64}.${sigB64}`;
}

export interface GdprVerifyResult {
  valid: boolean;
  payload?: GdprTokenPayload;
  error?: "format" | "signature" | "expired" | "decode";
}

export async function verifyGdprToken(token: string): Promise<GdprVerifyResult> {
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

  let payload: GdprTokenPayload;
  try {
    const json = fromUtf8(b64urlDecode(payloadB64));
    payload = JSON.parse(json) as GdprTokenPayload;
  } catch {
    return { valid: false, error: "decode" };
  }

  if (!payload.exp || new Date(payload.exp).getTime() < Date.now()) {
    return { valid: false, payload, error: "expired" };
  }
  if (payload.action !== "export" && payload.action !== "delete") {
    return { valid: false, payload, error: "decode" };
  }
  return { valid: true, payload };
}

export function buildGdprLinkUrl(
  siteUrl: string,
  action: GdprAction,
  token: string
): string {
  const base = siteUrl.replace(/\/+$/, "");
  return `${base}/api/gdpr/${action}?token=${encodeURIComponent(token)}`;
}
