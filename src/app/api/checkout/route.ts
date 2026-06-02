// POST /api/checkout — Stripe Checkout Session (server-side fiyat-authoritative).
//
// Anti-tampering: client'tan gelen totalPrice trust edilmez. Server-side
// catalog + service_overrides lookup ile gercek price hesaplanir.
// override.status='cancelled'|'sold_out' -> 409 reject.
// priceOnRequest -> 400 (telefon irtibat gerek).

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { computeServerTotal } from "@/lib/pricing";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const LOCALES = ["tr", "en", "de", "fr", "es", "nl", "zh", "hi", "ur"] as const;
const DEFAULT_LOCALE = "tr";

const checkoutSchema = z.object({
  serviceSlug: z.string().min(1),
  serviceName: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1).max(50),
  children: z.number().int().min(0).max(20),
  totalPrice: z.number().positive().max(100000).optional(),
  insurance: z.boolean().optional(),
  promoCode: z.string().max(40).optional(),
  currency: z.enum(["EUR", "TRY", "USD"]),
  customerEmail: z.string().email().optional().or(z.literal("")),
  locale: z.enum(LOCALES).optional(),
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tripandtick.com";

function localePath(locale: string | undefined): string {
  const l = locale ?? DEFAULT_LOCALE;
  return l === DEFAULT_LOCALE ? "" : `/${l}`;
}

function stripeLocale(locale: string | undefined): "tr" | "en" | "de" | "fr" | "es" | "nl" | "zh" | "auto" {
  const map: Record<string, "tr" | "en" | "de" | "fr" | "es" | "nl" | "zh"> = {
    tr: "tr", en: "en", de: "de", fr: "fr", es: "es", nl: "nl", zh: "zh",
  };
  return map[locale ?? ""] ?? "auto";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz istek verisi", details: parsed.error.flatten() }, { status: 400 });
    }
    const { serviceSlug, serviceName, currency, customerEmail, date, adults, children, locale, insurance, promoCode } = parsed.data;
    const lp = localePath(locale);

    const pricing = await computeServerTotal({
      serviceSlug,
      date,
      adults,
      children,
      insurance,
      promoCode,
    });
    if (!pricing.ok) {
      return NextResponse.json(
        { error: pricing.error, reason: pricing.reason ?? undefined },
        { status: pricing.status }
      );
    }
    const { serverTotal, override } = pricing;

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey || stripeKey === "sk_test_dummy" || stripeKey.startsWith("dummy")) {
      console.warn("[api/checkout] DEMO MODE — STRIPE_SECRET_KEY env-var yok");
      const demoUrl = `${SITE_URL}${lp}/rezervasyon/basarili?demo=1&total=${serverTotal}&currency=${currency}&slug=${encodeURIComponent(serviceSlug)}`;
      return NextResponse.json({
        url: demoUrl,
        demo: true,
        serverTotal,
        message: "Demo mode — Stripe env-var Cloudflare'de set degil.",
      });
    }

    let Stripe;
    try {
      Stripe = (await import("stripe")).default;
    } catch (err) {
      console.error("[api/checkout] Stripe SDK yuklenemedi", err);
      return NextResponse.json({ error: "Ödeme servisi şu anda kullanılamıyor" }, { status: 503 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: serviceName,
              description: `${adults} yetişkin + ${children} çocuk — Uçuş tarihi: ${date}${override?.priceOverride ? " (güncel fiyat)" : ""}`,
            },
            unit_amount: Math.round(serverTotal * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}${lp}/rezervasyon/basarili?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}${lp}/rezervasyon/iptal?slug=${encodeURIComponent(serviceSlug)}`,
      customer_email: customerEmail || undefined,
      metadata: {
        serviceSlug,
        date,
        adults: String(adults),
        children: String(children),
        insurance: insurance ? "1" : "0",
        promoCode: promoCode ?? "",
        locale: locale ?? DEFAULT_LOCALE,
        serverTotal: String(serverTotal),
        hasOverride: override ? "1" : "0",
      },
      locale: stripeLocale(locale),
    });

    return NextResponse.json({ url: session.url, serverTotal });
  } catch (err) {
    console.error("[api/checkout] Stripe session create error", err);
    return NextResponse.json({ error: "Ödeme oturumu oluşturulamadı. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
