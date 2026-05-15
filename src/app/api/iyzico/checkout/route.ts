// POST /api/iyzico/checkout — iyzico Checkout Form Initialize.
//
// Callers:
//   - src/app/rezervasyon/[slug]/BookingClient.tsx Step 5 odeme-yontemi="iyzico"
// Glob check: src/app/api/iyzico/ daha once yoktu.
// User verbatim: "iyzicoEnabled false ise demo URL dön (mevcut Stripe demo benzeri)"

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createCheckoutFormInitialize, iyzicoEnabled } from "@/lib/iyzico";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const itemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().default("Tour"),
  price: z.number().positive(),
});

const customerSchema = z.object({
  name: z.string().min(1),
  surname: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7).optional().or(z.literal("")),
  identityNumber: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  ip: z.string().optional(),
});

const checkoutSchema = z.object({
  bookingId: z.string().min(4),
  total: z.number().positive().max(1000000),
  currency: z.enum(["TRY", "USD", "EUR", "GBP"]).default("TRY"),
  items: z.array(itemSchema).min(1),
  customer: customerSchema,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tripandtick.com";

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
    const { bookingId, total, currency, items, customer } = parsed.data;
    const callbackUrl = `${SITE_URL}/api/iyzico/callback?bookingId=${encodeURIComponent(bookingId)}`;

    if (!iyzicoEnabled()) {
      console.warn("[api/iyzico/checkout] DEMO MODE — iyzico key bulunamadi");
      const demoUrl = `${SITE_URL}/rezervasyon/basarili?demo=1&provider=iyzico&total=${total}&currency=${currency}&bookingId=${encodeURIComponent(bookingId)}`;
      return NextResponse.json({
        paymentPageUrl: demoUrl,
        conversationId: bookingId,
        token: `demo-${bookingId}`,
        demo: true,
      });
    }

    const result = await createCheckoutFormInitialize({
      locale: "tr",
      conversationId: bookingId,
      price: total.toFixed(2),
      paidPrice: total.toFixed(2),
      currency,
      basketId: bookingId,
      paymentGroup: "PRODUCT",
      callbackUrl,
      buyer: {
        id: bookingId,
        name: customer.name,
        surname: customer.surname,
        email: customer.email,
        identityNumber: customer.identityNumber || "11111111111",
        registrationAddress: customer.address || "Kapadokya, Nevsehir, Turkiye",
        city: customer.city || "Nevsehir",
        country: customer.country || "Turkey",
        gsmNumber: customer.phone || undefined,
        ip: customer.ip || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "85.34.78.112",
      },
      shippingAddress: {
        contactName: `${customer.name} ${customer.surname}`,
        city: customer.city || "Nevsehir",
        country: customer.country || "Turkey",
        address: customer.address || "Kapadokya, Goreme",
      },
      billingAddress: {
        contactName: `${customer.name} ${customer.surname}`,
        city: customer.city || "Nevsehir",
        country: customer.country || "Turkey",
        address: customer.address || "Kapadokya, Goreme",
      },
      basketItems: items.map((it) => ({
        id: it.id,
        name: it.name,
        category1: it.category,
        itemType: "VIRTUAL",
        price: it.price.toFixed(2),
      })),
    });

    if (result.status !== "success" || !result.paymentPageUrl) {
      return NextResponse.json(
        { error: result.errorMessage ?? "iyzico checkout baslamadi" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      paymentPageUrl: result.paymentPageUrl,
      conversationId: result.conversationId ?? bookingId,
      token: result.token,
    });
  } catch (err) {
    console.error("[api/iyzico/checkout] error", err);
    return NextResponse.json(
      { error: "Odeme oturumu olusturulamadi. Lutfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
