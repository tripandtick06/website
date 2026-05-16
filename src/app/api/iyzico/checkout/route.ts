// POST /api/iyzico/checkout — Cloudflare Pages edge runtime.
//
// IYZICO_API_KEY + IYZICO_SECRET env set ise iyzico v2 REST'e gercek istek
// (WebCrypto HMAC SHA-256 via lib/iyzico-edge). Env yoksa demo-mode.
//
// Callers: src/app/[locale]/rezervasyon/[slug]/BookingClient.tsx Step 5 iyzico.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { iyzicoEnabled, checkoutFormInitialize } from "@/lib/iyzico-edge";
import { computeServerTotal } from "@/lib/pricing";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const LOCALES = ["tr", "en", "de", "fr", "es", "nl", "zh", "hi", "ur"] as const;
const DEFAULT_LOCALE = "tr";

const customerSchema = z.object({
  name: z.string().min(1).max(80).default("Misafir"),
  surname: z.string().min(1).max(80).default("Yolcu"),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  identityNumber: z.string().min(11).max(11).default("11111111111"),
  city: z.string().max(60).default("Nevsehir"),
  country: z.string().max(60).default("Turkey"),
  address: z.string().max(300).default("Kapadokya, Goreme"),
  zipCode: z.string().max(20).optional(),
});

const basketItemSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(200),
  category: z.string().max(60).default("Travel"),
  price: z.number().positive().max(1000000),
});

const checkoutSchema = z.object({
  bookingId: z.string().min(4),
  total: z.number().positive().max(1000000),
  currency: z.enum(["TRY", "USD", "EUR", "GBP"]).default("TRY"),
  locale: z.enum(LOCALES).optional(),
  items: z.array(basketItemSchema).optional(),
  customer: customerSchema.optional(),
  // Q4 server-side authoritative: serviceSlug+date varsa total recalculate, client ignore.
  serviceSlug: z.string().min(1).max(120).optional(),
  serviceName: z.string().min(1).max(200).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  adults: z.number().int().min(1).max(50).optional(),
  children: z.number().int().min(0).max(20).optional(),
  insurance: z.boolean().optional(),
  promoCode: z.string().max(40).optional(),
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tripandtick.com";

function localePath(locale: string | undefined): string {
  const l = locale ?? DEFAULT_LOCALE;
  return l === DEFAULT_LOCALE ? "" : `/${l}`;
}
function iyzicoLocale(locale: string | undefined): "tr" | "en" {
  return locale === "tr" ? "tr" : "en";
}
function money(n: number): string {
  return n.toFixed(2);
}
function clientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "85.34.78.112"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Gecersiz istek verisi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { bookingId, total, currency, locale, items, customer } = parsed.data;
    const lp = localePath(locale);

    // Server-side authoritative recalc — sadece serviceSlug+date+adults set ise.
    let serverTotal = total;
    let serverCurrency: string = currency;
    let serverItems = items;
    let hasOverride = false;
    if (parsed.data.serviceSlug && parsed.data.date && parsed.data.adults !== undefined) {
      const pricing = await computeServerTotal({
        serviceSlug: parsed.data.serviceSlug,
        date: parsed.data.date,
        adults: parsed.data.adults,
        children: parsed.data.children ?? 0,
        insurance: parsed.data.insurance,
        promoCode: parsed.data.promoCode,
      });
      if (!pricing.ok) {
        return NextResponse.json(
          { error: pricing.error, reason: pricing.reason ?? undefined },
          { status: pricing.status }
        );
      }
      serverTotal = pricing.serverTotal;
      serverCurrency = pricing.currency;
      hasOverride = Boolean(pricing.override);
      const desc = `${parsed.data.adults} yetiskin + ${parsed.data.children ?? 0} cocuk — ${parsed.data.date}${hasOverride ? " (guncel fiyat)" : ""}`;
      serverItems = [
        {
          id: parsed.data.serviceSlug,
          name: parsed.data.serviceName ?? pricing.catalog.name,
          category: desc,
          price: serverTotal,
        },
      ];
      console.info("[api/iyzico/checkout] server-auth recalc", {
        bookingId,
        clientTotal: total,
        serverTotal,
        hasOverride,
      });
    }

    if (!iyzicoEnabled()) {
      console.warn("[api/iyzico/checkout] DEMO — IYZICO env yok");
      const demoUrl = `${SITE_URL}${lp}/rezervasyon/basarili?demo=1&provider=iyzico&total=${serverTotal}&currency=${serverCurrency}&bookingId=${encodeURIComponent(bookingId)}`;
      return NextResponse.json({
        paymentPageUrl: demoUrl,
        conversationId: bookingId,
        token: `demo-${bookingId}`,
        demo: true,
        serverTotal,
        hasOverride,
        message: "Demo mode — IYZICO_API_KEY / IYZICO_SECRET env-var Cloudflare'de set degil.",
      });
    }

    const cust = customer ?? {
      name: "Misafir",
      surname: "Yolcu",
      email: "noreply@tripandtick.com",
      phone: "+905374647861",
      identityNumber: "11111111111",
      city: "Nevsehir",
      country: "Turkey",
      address: "Kapadokya, Goreme",
    };
    const basketItems = (serverItems && serverItems.length > 0
      ? serverItems
      : [{ id: "default", name: "TripAndTick Hizmet", category: "Travel", price: serverTotal }]
    ).map((it) => ({
      id: it.id,
      name: it.name,
      category1: it.category,
      itemType: "VIRTUAL" as const,
      price: money(it.price),
    }));
    const basketTotal = basketItems.reduce((sum, it) => sum + Number(it.price), 0);
    const price = money(basketTotal);
    const paidPrice = money(serverTotal);

    const callbackUrl = `${SITE_URL}/api/iyzico/callback?bookingId=${encodeURIComponent(bookingId)}&locale=${encodeURIComponent(locale ?? DEFAULT_LOCALE)}`;

    const result = await checkoutFormInitialize({
      conversationId: bookingId,
      price,
      paidPrice,
      currency: serverCurrency as "TRY" | "USD" | "EUR" | "GBP",
      basketId: bookingId,
      callbackUrl,
      locale: iyzicoLocale(locale),
      buyer: {
        id: bookingId,
        name: cust.name,
        surname: cust.surname,
        email: cust.email,
        gsmNumber: cust.phone,
        identityNumber: cust.identityNumber,
        registrationAddress: cust.address,
        ip: clientIp(req),
        city: cust.city,
        country: cust.country,
        zipCode: cust.zipCode,
      },
      shippingAddress: {
        contactName: `${cust.name} ${cust.surname}`,
        city: cust.city,
        country: cust.country,
        address: cust.address,
        zipCode: cust.zipCode,
      },
      billingAddress: {
        contactName: `${cust.name} ${cust.surname}`,
        city: cust.city,
        country: cust.country,
        address: cust.address,
        zipCode: cust.zipCode,
      },
      basketItems,
    });

    if (!result.ok || !result.raw.paymentPageUrl) {
      console.error("[api/iyzico/checkout] init failed", result.errorCode, result.errorMessage);
      return NextResponse.json(
        { error: result.errorMessage ?? "iyzico baslatilamadi", errorCode: result.errorCode },
        { status: 502 }
      );
    }

    return NextResponse.json({
      paymentPageUrl: result.raw.paymentPageUrl,
      conversationId: bookingId,
      token: result.raw.token,
      tokenExpireTime: result.raw.tokenExpireTime,
      serverTotal,
      hasOverride,
      demo: false,
    });
  } catch (err) {
    console.error("[api/iyzico/checkout] error", err);
    return NextResponse.json({ error: "Odeme oturumu olusturulamadi. Lutfen tekrar deneyin." }, { status: 500 });
  }
}
