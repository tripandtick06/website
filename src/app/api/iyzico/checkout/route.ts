// POST /api/iyzico/checkout — DEMO/STUB mode (Cloudflare Pages edge runtime).
//
// iyzipay SDK Node-only oldugu icin edge-safe degil; Faz 2'de REST + WebCrypto
// HMAC SHA256 ile native rewrite. Su an her zaman demo-mode (Stripe demo benzeri).
//
// Callers: src/app/rezervasyon/[slug]/BookingClient.tsx Step 5 odeme-yontemi="iyzico"

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const LOCALES = ["tr", "en", "de", "fr", "es", "nl", "zh", "hi", "ur"] as const;
const DEFAULT_LOCALE = "tr";

const checkoutSchema = z.object({
  bookingId: z.string().min(4),
  total: z.number().positive().max(1000000),
  currency: z.enum(["TRY", "USD", "EUR", "GBP"]).default("TRY"),
  locale: z.enum(LOCALES).optional(),
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tripandtick.com";

function localePath(locale: string | undefined): string {
  const l = locale ?? DEFAULT_LOCALE;
  return l === DEFAULT_LOCALE ? "" : `/${l}`;
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
    const { bookingId, total, currency, locale } = parsed.data;
    const lp = localePath(locale);
    const demoUrl = `${SITE_URL}${lp}/rezervasyon/basarili?demo=1&provider=iyzico&total=${total}&currency=${currency}&bookingId=${encodeURIComponent(bookingId)}`;
    return NextResponse.json({
      paymentPageUrl: demoUrl,
      conversationId: bookingId,
      token: `demo-${bookingId}`,
      demo: true,
    });
  } catch (err) {
    console.error("[api/iyzico/checkout] error", err);
    return NextResponse.json(
      { error: "Odeme oturumu olusturulamadi. Lutfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
