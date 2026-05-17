// Unsubscribe magic-link token — HMAC-SHA256 stateless verify (WebCrypto, edge).
//
// Importers (callers):
//   - src/app/api/admin/reschedule/route.ts (sign — bulk send)
//   - src/app/api/unsubscribe/route.ts (verify + opt-out)
// Payload: email | list (marketing|all)
//          → base64url(json) + "." + base64url(hmac)
// Secret: UNSUBSCRIBE_SECRET env (fallback RESCHEDULE_SECRET, ADMIN_API_TOKEN).
// No exp — unsubscribe link her zaman gecerli (RFC 8058 best practice).

export type UnsubscribeList = "marketing" | "all";

export interface UnsubscribeTokenPayload {
  email: string;
  list: UnsubscribeList;
}

function secret(): string {
  const s =
    process.env.UNSUBSCRIBE_SECRET ??
    process.env.RESCHEDULE_SECRET ??
    process.env.ADMIN_API_TOKEN;
  if (!s || s.length < 8) {
    return "demo-unsubscribe-secret-rotate-me-32bytes-min";
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

export async function signUnsubscribeToken(
  email: string,
  list: UnsubscribeList = "marketing"
): Promise<string> {
  const payload: UnsubscribeTokenPayload = {
    email: email.trim().toLowerCase(),
    list,
  };
  const json = JSON.stringify(payload);
  const payloadB64 = b64urlEncode(utf8(json));
  const sig = await hmac(secret(), payloadB64);
  const sigB64 = b64urlEncode(sig);
  return `${payloadB64}.${sigB64}`;
}

export interface UnsubVerifyResult {
  valid: boolean;
  payload?: UnsubscribeTokenPayload;
  error?: "format" | "signature" | "decode";
}

export async function verifyUnsubscribeToken(token: string): Promise<UnsubVerifyResult> {
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

  let payload: UnsubscribeTokenPayload;
  try {
    const json = fromUtf8(b64urlDecode(payloadB64));
    payload = JSON.parse(json) as UnsubscribeTokenPayload;
  } catch {
    return { valid: false, error: "decode" };
  }
  return { valid: true, payload };
}

export function buildUnsubscribeUrl(siteUrl: string, token: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  return `${base}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}
