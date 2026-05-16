// Stripe Refunds API — edge-runtime safe via direct fetch (no SDK).
//
// Callers:
//   - src/app/api/rezervasyon/yeniden-tarih/route.ts (customer refund branch)
//   - src/app/api/admin/refund/route.ts (admin manual refund)
// Env: STRIPE_SECRET_KEY. Yoksa demo log fallback.
//
// Reference: https://docs.stripe.com/api/refunds/create

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export interface StripeRefundInput {
  /** payment_intent (pi_...) OR sessionId (cs_...). En az biri zorunlu. */
  paymentIntent?: string | null;
  sessionId?: string | null;
  /** Kismi iade icin minor-units (kurus/cent). Yoksa tam iade. */
  amountMinor?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
  metadata?: Record<string, string>;
}

export interface StripeRefundResult {
  ok: boolean;
  refundId?: string;
  status?: string;
  amountMinor?: number;
  currency?: string;
  error?: string;
  demoLogged?: boolean;
}

function stripeEnabled(): boolean {
  const k = STRIPE_SECRET_KEY?.trim();
  return !!k && !k.startsWith("dummy") && k !== "sk_test_dummy";
}

async function stripeGet<T>(path: string): Promise<T | null> {
  if (!stripeEnabled()) return null;
  try {
    const res = await fetch(`https://api.stripe.com/v1/${path}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[stripe-refund] GET fail", path, res.status, txt);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error("[stripe-refund] GET error", path, err);
    return null;
  }
}

async function resolvePaymentIntent(input: StripeRefundInput): Promise<string | null> {
  if (input.paymentIntent) return input.paymentIntent;
  if (!input.sessionId) return null;
  const session = await stripeGet<{ payment_intent: string | { id: string } | null }>(
    `checkout/sessions/${encodeURIComponent(input.sessionId)}`
  );
  if (!session || !session.payment_intent) return null;
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent.id;
}

export async function createStripeRefund(input: StripeRefundInput): Promise<StripeRefundResult> {
  if (!stripeEnabled()) {
    console.info("[stripe-refund] STRIPE_SECRET_KEY yok — demo log", {
      paymentIntent: input.paymentIntent,
      sessionId: input.sessionId,
      amountMinor: input.amountMinor,
    });
    return { ok: false, demoLogged: true };
  }
  const pi = await resolvePaymentIntent(input);
  if (!pi) {
    return { ok: false, error: "payment_intent veya sessionId cozulemedi" };
  }

  const form = new URLSearchParams();
  form.append("payment_intent", pi);
  if (typeof input.amountMinor === "number" && input.amountMinor > 0) {
    form.append("amount", String(Math.round(input.amountMinor)));
  }
  if (input.reason) form.append("reason", input.reason);
  if (input.metadata) {
    for (const [k, v] of Object.entries(input.metadata)) {
      form.append(`metadata[${k}]`, v);
    }
  }

  try {
    const res = await fetch("https://api.stripe.com/v1/refunds", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[stripe-refund] POST fail", res.status, txt);
      return { ok: false, error: `Stripe ${res.status}: ${txt.slice(0, 200)}` };
    }
    const data = (await res.json()) as {
      id: string;
      status: string;
      amount: number;
      currency: string;
    };
    return {
      ok: true,
      refundId: data.id,
      status: data.status,
      amountMinor: data.amount,
      currency: data.currency,
    };
  } catch (err) {
    console.error("[stripe-refund] fetch error", err);
    return { ok: false, error: err instanceof Error ? err.message : "Bilinmeyen hata" };
  }
}
