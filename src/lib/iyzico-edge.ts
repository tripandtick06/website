// iyzico edge-compatible REST helper — WebCrypto SHA-256 HMAC, IYZWSv2 auth.
//
// Importers (callers):
//   - src/app/api/iyzico/checkout/route.ts (Checkout Form Initialize)
//   - src/app/api/iyzico/callback/route.ts (Checkout Form Retrieve)
// Affected: iyzipay-node SDK (Node-only) yerine native fetch + WebCrypto.
// API: iyzico Checkout Form Initialize/Retrieve REST v2 (Authorization: IYZWSv2 ...)
// Reference: dev.iyzipay.com/tr/api/odeme-formu

const DEFAULT_BASE_URL = "https://sandbox-api.iyzipay.com";

export function iyzicoEnabled(): boolean {
  return !!process.env.IYZICO_API_KEY && !!process.env.IYZICO_SECRET;
}

export function iyzicoBaseUrl(): string {
  return process.env.IYZICO_BASE_URL ?? DEFAULT_BASE_URL;
}

function randomString(len = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

function bytesToHex(buf: ArrayBuffer): string {
  const arr = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += arr[i].toString(16).padStart(2, "0");
  return s;
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return bytesToHex(sig);
}

export interface IyzicoResponseEnvelope<T> {
  ok: boolean;
  status?: string;
  errorCode?: string;
  errorMessage?: string;
  raw: T;
}

async function callIyzico<T>(uri: string, body: Record<string, unknown>): Promise<IyzicoResponseEnvelope<T>> {
  const apiKey = process.env.IYZICO_API_KEY ?? "";
  const secret = process.env.IYZICO_SECRET ?? "";
  const baseUrl = iyzicoBaseUrl();

  const random = randomString();
  const bodyJson = JSON.stringify(body);
  const signature = await hmacSha256Hex(secret, random + uri + bodyJson);
  const authHeader = "IYZWSv2 " + btoa(`${apiKey}:${signature}`);

  const res = await fetch(`${baseUrl}${uri}`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "x-iyzi-rnd": random,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: bodyJson,
  });

  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    data = { raw: text };
  }
  const status = typeof data.status === "string" ? data.status : undefined;
  const ok = res.ok && status === "success";
  return {
    ok,
    status,
    errorCode: typeof data.errorCode === "string" ? data.errorCode : undefined,
    errorMessage: typeof data.errorMessage === "string" ? data.errorMessage : undefined,
    raw: data as T,
  };
}

// =====================================================================
// Checkout Form Initialize
// =====================================================================
export interface CheckoutFormInitParams {
  conversationId: string;
  price: string;            // "100.00" format
  paidPrice: string;
  currency: "TRY" | "USD" | "EUR" | "GBP" | "IRR" | "NOK" | "RUB" | "CHF";
  basketId: string;
  callbackUrl: string;
  locale?: "tr" | "en";
  buyer: {
    id: string;
    name: string;
    surname: string;
    gsmNumber?: string;
    email: string;
    identityNumber: string;
    registrationAddress: string;
    ip: string;
    city: string;
    country: string;
    zipCode?: string;
  };
  shippingAddress: { contactName: string; city: string; country: string; address: string; zipCode?: string };
  billingAddress: { contactName: string; city: string; country: string; address: string; zipCode?: string };
  basketItems: { id: string; name: string; category1: string; itemType: "VIRTUAL" | "PHYSICAL"; price: string }[];
  enabledInstallments?: number[];
}

export interface CheckoutFormInitResponse {
  status: string;
  errorCode?: string;
  errorMessage?: string;
  token?: string;
  paymentPageUrl?: string;
  checkoutFormContent?: string;
  tokenExpireTime?: number;
}

export async function checkoutFormInitialize(p: CheckoutFormInitParams): Promise<IyzicoResponseEnvelope<CheckoutFormInitResponse>> {
  const body: Record<string, unknown> = {
    locale: p.locale ?? "tr",
    conversationId: p.conversationId,
    price: p.price,
    paidPrice: p.paidPrice,
    currency: p.currency,
    basketId: p.basketId,
    paymentGroup: "PRODUCT",
    callbackUrl: p.callbackUrl,
    enabledInstallments: p.enabledInstallments ?? [1, 2, 3, 6, 9],
    buyer: p.buyer,
    shippingAddress: p.shippingAddress,
    billingAddress: p.billingAddress,
    basketItems: p.basketItems,
  };
  return callIyzico<CheckoutFormInitResponse>("/payment/iyzipos/checkoutform/initialize/auth/ecom", body);
}

// =====================================================================
// Checkout Form Retrieve (callback verify)
// =====================================================================
export interface CheckoutFormRetrieveResponse {
  status: string;
  paymentStatus?: string;        // SUCCESS / FAILURE
  paymentId?: string;
  conversationId?: string;
  basketId?: string;
  price?: number;
  paidPrice?: number;
  currency?: string;
  errorCode?: string;
  errorMessage?: string;
}

export async function checkoutFormRetrieve(token: string, conversationId: string, locale: "tr" | "en" = "tr"): Promise<IyzicoResponseEnvelope<CheckoutFormRetrieveResponse>> {
  const body = { locale, conversationId, token };
  return callIyzico<CheckoutFormRetrieveResponse>("/payment/iyzipos/checkoutform/auth/ecom/detail", body);
}
