// POST /api/checkout — Stripe Checkout Session (server-side fiyat-authoritative).
//
// Anti-tampering: client'tan gelen totalPrice trust edilmez. Server-side
// catalog + service_overrides lookup ile gercek price hesaplanir.
// override.status='cancelled'|'sold_out' -> 409 reject.
// priceOnRequest -> 400 (telefon irtibat gerek).

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getOverride } from "@/lib/db/service-overrides";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { ACTIVITIES, TOURS, HOTELS, PACKAGES, TRANSFERS } from "@/data/services/catalog";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const LOCALES = ["tr", "en", "de", "fr", "es", "nl", "zh", "hi", "ur"] as const;
const DEFAULT_LOCALE = "tr";
const INSURANCE_PRICE_PER_PAX = 15;
const DEFAULT_CHILD_RATIO = 0.8;

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tripandtick.com";

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

interface CatalogEntry {
  slug: string;
  name: string;
  adultPrice: number;
  childRatio: number;
  currency: string;
  priceOnRequest?: boolean;
}

function findCatalog(slug: string): CatalogEntry | null {
  const b = BALLOON_PACKAGES.find((p) => p.slug === slug);
  if (b) return { slug: b.slug, name: b.name, adultPrice: b.adultPrice, childRatio: b.childRatio, currency: b.currency, priceOnRequest: b.priceOnRequest };
  const all = [...ACTIVITIES, ...TOURS, ...HOTELS, ...PACKAGES, ...TRANSFERS];
  const it = all.find((s) => s.slug === slug);
  if (it) return { slug: it.slug, name: it.name, adultPrice: it.adultPrice, childRatio: DEFAULT_CHILD_RATIO, currency: it.currency, priceOnRequest: it.priceOnRequest };
  return null;
}

function promoDiscount(code: string | undefined, preDiscount: number): number {
  if (!code) return 0;
  const c = code.toUpperCase().trim();
  if (c === "WELCOME10") return Math.round(preDiscount * 0.1);
  if (c === "EMERCE5") return Math.round(preDiscount * 0.05);
  if (c === "AILE15") return Math.round(preDiscount * 0.15);
  return 0;
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

    const catalog = findCatalog(serviceSlug);
    if (!catalog) {
      return NextResponse.json({ error: "Hizmet bulunamadi" }, { status: 404 });
    }
    if (catalog.priceOnRequest) {
      return NextResponse.json(
        { error: "Bu hizmet icin direkt online odeme yok — bizimle iletisime gecin (telefon/WhatsApp)." },
        { status: 400 }
      );
    }

    const override = await getOverride(serviceSlug, date).catch(() => null);
    if (override?.status === "cancelled" || override?.status === "sold_out") {
      return NextResponse.json(
        { error: `Bu tarih ${override.status === "cancelled" ? "iptal" : "dolu"} — lutfen baska tarih secin.`, reason: override.cancellationReason },
        { status: 409 }
      );
    }

    const effectiveAdultPrice = override?.priceOverride ?? catalog.adultPrice;
    const pax = adults + children;
    const adultsLine = adults * effectiveAdultPrice;
    const childrenLine = Math.round(children * effectiveAdultPrice * catalog.childRatio);
    const insuranceLine = insurance ? pax * INSURANCE_PRICE_PER_PAX : 0;
    const preDiscount = adultsLine + childrenLine + insuranceLine;
    const discount = promoDiscount(promoCode, preDiscount);
    const serverTotal = Math.max(1, preDiscount - discount);

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
