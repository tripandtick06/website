// iyzico SDK wrapper — Faz 2 TRY/USD/EUR odeme entegrasyonu (test mode default).
//
// Importers:
//   - src/app/api/iyzico/checkout/route.ts (checkout form initialize)
//   - src/app/api/iyzico/callback/route.ts (callback verify)
// Affected: TR kart sahipleri (Amex/UnionPay TRY-only) icin alternatif odeme.
// Data: process.env.IYZICO_API_KEY / IYZICO_SECRET_KEY / IYZICO_BASE_URL
// User verbatim: "iyzico TRY tam destek, test mode + Sadakat + Referans"
//
// SECURITY:
//   - Sandbox default; prod oncesi env'leri canli key ile degistir.
//   - apiKey + secretKey ASLA client'a sizmaz (server-only).

export interface IyzicoEnv {
  apiKey: string;
  secretKey: string;
  uri: string;
}

export function iyzicoEnabled(): boolean {
  const k = process.env.IYZICO_API_KEY?.trim();
  const s = process.env.IYZICO_SECRET_KEY?.trim();
  return Boolean(k && s && !k.startsWith("REPLACE") && !s.startsWith("REPLACE"));
}

export function getIyzicoEnv(): IyzicoEnv {
  return {
    apiKey: process.env.IYZICO_API_KEY ?? "sandbox-dummy-api-key",
    secretKey: process.env.IYZICO_SECRET_KEY ?? "sandbox-dummy-secret-key",
    uri: process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com",
  };
}

// iyzico Iyzipay payload shape (subset).
export interface IyzicoBuyer {
  id: string;
  name: string;
  surname: string;
  email: string;
  identityNumber: string;
  registrationAddress: string;
  city: string;
  country: string;
  gsmNumber?: string;
  ip?: string;
  zipCode?: string;
}

export interface IyzicoAddress {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}

export interface IyzicoBasketItem {
  id: string;
  name: string;
  category1: string;
  itemType: "PHYSICAL" | "VIRTUAL";
  price: string;
}

export interface IyzicoCheckoutPayload {
  locale?: "tr" | "en";
  conversationId: string;
  price: string;
  paidPrice: string;
  currency: "TRY" | "USD" | "EUR" | "GBP";
  basketId: string;
  paymentGroup: "PRODUCT" | "LISTING" | "SUBSCRIPTION";
  callbackUrl: string;
  buyer: IyzicoBuyer;
  shippingAddress: IyzicoAddress;
  billingAddress: IyzicoAddress;
  basketItems: IyzicoBasketItem[];
}

export interface IyzicoCheckoutResult {
  status: "success" | "failure";
  errorMessage?: string;
  paymentPageUrl?: string;
  token?: string;
  conversationId?: string;
}

/**
 * iyzico Checkout Form Initialize.
 *
 * SDK 'iyzipay' (^2.0.61) Iyzipay.checkoutFormInitialize.create(payload, cb)
 * callback-based; biz Promise'e sariyoruz.
 *
 * Demo mode (key yok): demo URL doner; production-side gercek SDK cagri.
 */
export async function createCheckoutFormInitialize(
  payload: IyzicoCheckoutPayload
): Promise<IyzicoCheckoutResult> {
  if (!iyzicoEnabled()) {
    // Demo mode — Stripe checkout demo benzeri.
    return {
      status: "success",
      paymentPageUrl: `${payload.callbackUrl}?demo=1&conversationId=${encodeURIComponent(payload.conversationId)}`,
      token: `demo-token-${payload.conversationId}`,
      conversationId: payload.conversationId,
    };
  }

  const env = getIyzicoEnv();

  let IyzipayMod: unknown;
  try {
    const mod = await import("iyzipay");
    IyzipayMod = (mod as { default?: unknown }).default ?? mod;
  } catch (err) {
    console.error("[iyzico] SDK yuklenemedi", err);
    return { status: "failure", errorMessage: "iyzico SDK yuklenemedi" };
  }

  const iyzipay = new (IyzipayMod as new (cfg: IyzicoEnv) => unknown)({
    apiKey: env.apiKey,
    secretKey: env.secretKey,
    uri: env.uri,
  }) as {
    checkoutFormInitialize: {
      create: (
        req: unknown,
        cb: (err: Error | null, result: Record<string, unknown>) => void
      ) => void;
    };
  };

  return new Promise<IyzicoCheckoutResult>((resolve) => {
    iyzipay.checkoutFormInitialize.create(payload, (err, result) => {
      if (err) {
        console.error("[iyzico] checkoutFormInitialize error", err);
        resolve({ status: "failure", errorMessage: err.message ?? String(err) });
        return;
      }
      const status = (result?.status as string) === "success" ? "success" : "failure";
      resolve({
        status,
        paymentPageUrl: result?.paymentPageUrl as string | undefined,
        token: result?.token as string | undefined,
        conversationId: result?.conversationId as string | undefined,
        errorMessage: result?.errorMessage as string | undefined,
      });
    });
  });
}

/**
 * iyzico Retrieve Payment (callback dogrulamasi).
 * Token + conversationId ile ucret durumu sorgulanir.
 */
export async function retrieveCheckoutForm(
  token: string,
  conversationId: string
): Promise<{ status: "success" | "failure"; paymentStatus?: string; raw?: Record<string, unknown> }> {
  if (!iyzicoEnabled()) {
    // Demo mode — daima success.
    return { status: "success", paymentStatus: "SUCCESS" };
  }

  const env = getIyzicoEnv();

  let IyzipayMod: unknown;
  try {
    const mod = await import("iyzipay");
    IyzipayMod = (mod as { default?: unknown }).default ?? mod;
  } catch (err) {
    console.error("[iyzico] SDK yuklenemedi", err);
    return { status: "failure" };
  }

  const iyzipay = new (IyzipayMod as new (cfg: IyzicoEnv) => unknown)({
    apiKey: env.apiKey,
    secretKey: env.secretKey,
    uri: env.uri,
  }) as {
    checkoutForm: {
      retrieve: (
        req: { locale: string; token: string; conversationId: string },
        cb: (err: Error | null, result: Record<string, unknown>) => void
      ) => void;
    };
  };

  return new Promise((resolve) => {
    iyzipay.checkoutForm.retrieve(
      { locale: "tr", token, conversationId },
      (err, result) => {
        if (err) {
          console.error("[iyzico] retrieve error", err);
          resolve({ status: "failure" });
          return;
        }
        resolve({
          status: (result?.status as string) === "success" ? "success" : "failure",
          paymentStatus: result?.paymentStatus as string | undefined,
          raw: result,
        });
      }
    );
  });
}
