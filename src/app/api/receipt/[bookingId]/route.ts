// Receipt / fatura HTML endpoint — print-to-PDF friendly.
// User verbatim: "en uzunundan basla, en son benim mudahelem gereken seyleri yap"
//
// Callers: src/app/rezervasyon/basarili/page.tsx, src/app/hesabim/page.tsx.
// Glob check: src/app/api/receipt/** previously empty.
// Data: bookingId URL segment + query reconstruct (faz 1 mock).

import { NextResponse, type NextRequest } from "next/server";
import { receiptHtml } from "@/lib/receipt-html";
import type { BookingEmailPayload } from "@/lib/email-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ctx {
  params: { bookingId: string };
}

function pickLocale(s: string | null): "tr" | "en" {
  if (s === "en" || s === "EN") return "en";
  return "tr";
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const bookingId = ctx.params.bookingId || "TT-UNKNOWN";
  const url = new URL(req.url);
  const locale = pickLocale(url.searchParams.get("lang"));

  const serviceName = url.searchParams.get("serviceName") || "Kapadokya Balon Turu";
  const serviceSlug = url.searchParams.get("serviceSlug") || "kapadokya-balon-turu";
  const date = url.searchParams.get("date") || new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const adults = Math.max(1, Number(url.searchParams.get("adults") ?? "2") || 2);
  const children = Math.max(0, Number(url.searchParams.get("children") ?? "0") || 0);
  const totalPrice = Math.max(0, Number(url.searchParams.get("total") ?? "350") || 350);
  const currency = (url.searchParams.get("currency") || "EUR").toUpperCase();
  const customerName = url.searchParams.get("customerName") || "Musafir";
  const customerEmail = url.searchParams.get("customerEmail") || "—";
  const customerPhone = url.searchParams.get("customerPhone") || "—";
  const insurance = url.searchParams.get("insurance") === "1";

  const payload: BookingEmailPayload = {
    bookingId,
    customerName,
    customerEmail,
    customerPhone,
    serviceName,
    serviceSlug,
    date,
    adults,
    children,
    totalPrice,
    currency,
    insurance,
    createdAt: new Date().toISOString(),
  };

  const html = receiptHtml(payload, locale, { autoPrint: url.searchParams.get("autoPrint") !== "0" });

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
