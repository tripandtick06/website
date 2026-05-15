// POST/GET /api/iyzico/callback — iyzico hosted-page donus dogrulamasi.
//
// Callers:
//   - iyzico Checkout Form (paymentPageUrl) submit sonrasi (external)
// Affected: rezervasyon basarili / iptal sayfa yonlendirmesi.
// User verbatim: "iyzico'dan donus, payment status check; Booking status update (paid/failed);
// Redirect `/rezervasyon/basarili?token=...` veya `/rezervasyon/iptal`"
//
// SECURITY:
//   - Token + conversationId iyzico-server-side dogrulama (retrieveCheckoutForm).
//   - Client tarafindan manipule edilemez.

import { NextResponse, type NextRequest } from "next/server";
import { retrieveCheckoutForm } from "@/lib/iyzico";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tripandtick.com";

async function handle(req: NextRequest, body: Record<string, string>): Promise<NextResponse> {
  const url = new URL(req.url);
  const bookingId = url.searchParams.get("bookingId") ?? body.bookingId ?? "";
  const token = body.token ?? url.searchParams.get("token") ?? "";
  const conversationIdParam = body.conversationId ?? bookingId;

  if (!token || !bookingId) {
    return NextResponse.redirect(`${SITE_URL}/rezervasyon/iptal?reason=missing-token`);
  }

  try {
    const verify = await retrieveCheckoutForm(token, conversationIdParam);
    if (verify.status === "success" && (verify.paymentStatus === "SUCCESS" || !verify.paymentStatus)) {
      // Basarili — booking-detail page'i redirect (token query string ile).
      const target = new URL(`${SITE_URL}/rezervasyon/basarili`);
      target.searchParams.set("provider", "iyzico");
      target.searchParams.set("token", token);
      target.searchParams.set("bookingId", bookingId);
      return NextResponse.redirect(target.toString());
    }
    return NextResponse.redirect(
      `${SITE_URL}/rezervasyon/iptal?provider=iyzico&reason=${encodeURIComponent(verify.paymentStatus ?? "failure")}&bookingId=${encodeURIComponent(bookingId)}`
    );
  } catch (err) {
    console.error("[api/iyzico/callback] verify error", err);
    return NextResponse.redirect(
      `${SITE_URL}/rezervasyon/iptal?provider=iyzico&reason=error&bookingId=${encodeURIComponent(bookingId)}`
    );
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, string> = {};
  try {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData();
      form.forEach((v, k) => {
        body[k] = String(v);
      });
    } else if (ct.includes("application/json")) {
      body = await req.json();
    }
  } catch {
    body = {};
  }
  return handle(req, body);
}

export async function GET(req: NextRequest) {
  return handle(req, {});
}
