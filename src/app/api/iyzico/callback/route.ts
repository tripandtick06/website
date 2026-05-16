// POST/GET /api/iyzico/callback — iyzico hosted page submit-back.
//
// IYZICO_API_KEY+IYZICO_SECRET env set ise checkoutFormRetrieve ile token verify;
// paymentStatus=SUCCESS -> basarili page, FAILURE -> iptal page. Env yoksa demo
// fallback (token "demo-" prefix ise direkt basarili).

import { NextResponse, type NextRequest } from "next/server";
import { iyzicoEnabled, checkoutFormRetrieve } from "@/lib/iyzico-edge";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tripandtick.com";
const DEFAULT_LOCALE = "tr";

function localePath(locale: string | undefined): string {
  const l = locale ?? DEFAULT_LOCALE;
  return l === DEFAULT_LOCALE ? "" : `/${l}`;
}

async function handle(req: NextRequest, body: Record<string, string>): Promise<NextResponse> {
  const url = new URL(req.url);
  const bookingId = url.searchParams.get("bookingId") ?? body.bookingId ?? "";
  const token = body.token ?? url.searchParams.get("token") ?? "";
  const locale = url.searchParams.get("locale") ?? body.locale ?? DEFAULT_LOCALE;
  const lp = localePath(locale);

  if (!token || !bookingId) {
    return NextResponse.redirect(`${SITE_URL}${lp}/rezervasyon/iptal?reason=missing-token`);
  }

  if (!iyzicoEnabled() || token.startsWith("demo-")) {
    const target = new URL(`${SITE_URL}${lp}/rezervasyon/basarili`);
    target.searchParams.set("provider", "iyzico");
    target.searchParams.set("token", token);
    target.searchParams.set("bookingId", bookingId);
    target.searchParams.set("demo", "1");
    return NextResponse.redirect(target.toString());
  }

  try {
    const result = await checkoutFormRetrieve(token, bookingId, locale === "tr" ? "tr" : "en");
    const ok = result.ok && result.raw.paymentStatus === "SUCCESS";

    if (!ok) {
      const target = new URL(`${SITE_URL}${lp}/rezervasyon/iptal`);
      target.searchParams.set("reason", result.errorMessage ?? result.raw.paymentStatus ?? "payment-failed");
      target.searchParams.set("bookingId", bookingId);
      return NextResponse.redirect(target.toString());
    }

    const target = new URL(`${SITE_URL}${lp}/rezervasyon/basarili`);
    target.searchParams.set("provider", "iyzico");
    target.searchParams.set("bookingId", bookingId);
    if (result.raw.paymentId) target.searchParams.set("paymentId", result.raw.paymentId);
    if (result.raw.paidPrice != null) target.searchParams.set("total", String(result.raw.paidPrice));
    if (result.raw.currency) target.searchParams.set("currency", result.raw.currency);
    return NextResponse.redirect(target.toString());
  } catch (err) {
    console.error("[api/iyzico/callback] verify error", err);
    const target = new URL(`${SITE_URL}${lp}/rezervasyon/iptal`);
    target.searchParams.set("reason", "verify-error");
    return NextResponse.redirect(target.toString());
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
