import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  serviceSlug: z.string().min(1),
  serviceName: z.string().min(1),
  date: z.string().min(8),
  adults: z.number().int().min(1).max(50),
  children: z.number().int().min(0).max(20),
  totalPrice: z.number().positive().max(100000),
  currency: z.enum(["EUR", "TRY", "USD"]),
  customerEmail: z.string().email().optional().or(z.literal("")),
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tripandtick.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz istek verisi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { serviceSlug, serviceName, totalPrice, currency, customerEmail, date, adults, children } = parsed.data;

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // Demo mode — Stripe key yoksa direkt success-page URL'i dondur
    if (!stripeKey || stripeKey === "sk_test_dummy" || stripeKey.startsWith("dummy")) {
      console.warn("[api/checkout] DEMO MODE — Stripe key bulunamadi");
      const demoUrl = `${SITE_URL}/rezervasyon/basarili?demo=1&total=${totalPrice}&currency=${currency}&slug=${encodeURIComponent(serviceSlug)}`;
      return NextResponse.json({ url: demoUrl, demo: true });
    }

    // Real Stripe Checkout
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
              description: `${adults} yetişkin + ${children} çocuk — Uçuş tarihi: ${date}`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/rezervasyon/basarili?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/rezervasyon/iptal?slug=${encodeURIComponent(serviceSlug)}`,
      customer_email: customerEmail || undefined,
      metadata: {
        serviceSlug,
        date,
        adults: String(adults),
        children: String(children),
      },
      locale: "tr",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[api/checkout] Stripe session create error", err);
    return NextResponse.json(
      { error: "Ödeme oturumu oluşturulamadı. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
