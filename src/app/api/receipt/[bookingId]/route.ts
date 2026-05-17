// Receipt / fatura HTML endpoint — print-to-PDF friendly.
//
// Callers: src/app/rezervasyon/basarili/page.tsx, src/app/hesabim/page.tsx.
// Data: bookingId URL segment + query reconstruct (mock mode) veya Supabase lookup.
// Auth (IDOR fix): Supabase enabled + booking bulundu ise query ?email zorunlu;
//   booking.passengers[0].email ile constant-time compare; mismatch → 404.
//   Mock fallback (Supabase yok) — query'den render eder.

import { NextResponse, type NextRequest } from "next/server";
import { receiptHtml } from "@/lib/receipt-html";
import type { BookingEmailPayload } from "@/lib/email-templates";
import { getBookingById } from "@/lib/db/bookings";
import { supabaseEnabled } from "@/lib/supabase";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface Ctx {
  params: { bookingId: string };
}

function pickLocale(s: string | null): "tr" | "en" {
  if (s === "en" || s === "EN") return "en";
  return "tr";
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function notFound() {
  return new NextResponse("Rezervasyon bulunamadi", {
    status: 404,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}

export async function GET(req: NextRequest, ctx: Ctx) {
  const bookingId = ctx.params.bookingId || "TT-UNKNOWN";
  const url = new URL(req.url);
  const locale = pickLocale(url.searchParams.get("lang"));
  const queryEmail = (url.searchParams.get("email") || url.searchParams.get("customerEmail") || "")
    .trim()
    .toLowerCase();

  // Supabase varsa booking lookup + email-eslesme zorunlu (IDOR koruma).
  if (supabaseEnabled) {
    const booking = await getBookingById(bookingId).catch(() => null);
    if (booking) {
      const dbEmail = (booking.passengers[0]?.email ?? "").trim().toLowerCase();
      if (!queryEmail || !dbEmail || !timingSafeEqualStr(queryEmail, dbEmail)) {
        return notFound();
      }
      const payload: BookingEmailPayload = {
        bookingId: booking.id,
        customerName: booking.passengers[0]?.fullName ?? "Musafir",
        customerEmail: dbEmail || "—",
        customerPhone: booking.passengers[0]?.phone ?? "—",
        serviceName: booking.serviceName,
        serviceSlug: booking.serviceSlug,
        date: booking.date,
        adults: booking.adults,
        children: booking.children,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
        insurance: booking.insurance,
        createdAt: booking.createdAt,
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
    // Supabase enabled ama booking yok → 404.
    return notFound();
  }

  // Mock-mode (Supabase yok) — backwards compat query-based render.
  const serviceName = url.searchParams.get("serviceName") || "Kapadokya Balon Turu";
  const serviceSlug = url.searchParams.get("serviceSlug") || "kapadokya-balon-turu";
  const date = url.searchParams.get("date") || new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const adults = Math.max(1, Number(url.searchParams.get("adults") ?? "2") || 2);
  const children = Math.max(0, Number(url.searchParams.get("children") ?? "0") || 0);
  const totalPrice = Math.max(0, Number(url.searchParams.get("total") ?? "350") || 350);
  const currency = (url.searchParams.get("currency") || "EUR").toUpperCase();
  const customerName = url.searchParams.get("customerName") || "Musafir";
  const customerEmail = url.searchParams.get("customerEmail") || queryEmail || "—";
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
