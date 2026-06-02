// /api/gdpr/export — user-initiated personal data export (GDPR Madde 15).
//
// GET ?token=...   -> verify HMAC + emit JSON bundle as attachment.
// Token TTL: 24h. Action must be "export".
//
// Data included: customer profile + bookings + loyalty transactions (if any).
// Excluded (legitimate interest / legal hold): Stripe payment records,
// webhook event audit trail, finance/tax archives (10y retention per Turkish
// tax law) — referenced by ID only.

import { NextResponse, type NextRequest } from "next/server";
import { verifyGdprToken } from "@/lib/gdpr-token";
import {
  getCustomerByEmail,
  type DBCustomer,
} from "@/lib/db/customers";
import {
  listBookingsByCustomer,
  type DBBooking,
} from "@/lib/db/bookings";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tripandtick.com";

function htmlError(status: number, title: string, message: string) {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>${esc(title)} — Trip and Tick</title><meta name="robots" content="noindex,nofollow"></head><body style="font-family:system-ui,sans-serif;max-width:560px;margin:48px auto;padding:24px;color:#1e293b"><h1 style="color:#dc2626">${esc(title)}</h1><p>${esc(message)}</p><p><a href="${SITE_URL}/gdpr">Yeni bag iste</a> &middot; <a href="${SITE_URL}">Ana sayfaya don</a></p></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

interface ExportBundle {
  exportedAt: string;
  dataController: {
    name: string;
    contact: string;
    siteUrl: string;
  };
  gdprArticle: string;
  subject: {
    email: string;
  };
  customer: DBCustomer | null;
  bookings: DBBooking[];
  notes: {
    paymentRecords: string;
    auditTrail: string;
    retentionPolicy: string;
  };
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return htmlError(400, "Bag eksik", "URL'de token parametresi bulunamadi.");
  }
  const result = await verifyGdprToken(token);
  if (!result.valid || !result.payload) {
    const msg =
      result.error === "expired"
        ? "Bag suresi doldu (24 saat). Lutfen yeni bir bag isteyin."
        : "Gecersiz veya bozuk bag.";
    return htmlError(403, "Erisim reddedildi", msg);
  }
  if (result.payload.action !== "export") {
    return htmlError(
      403,
      "Yanlis islem",
      "Bu bag silme islemi icindir. Disa aktarma icin yeni bir bag isteyin."
    );
  }

  const email = result.payload.email;
  const customer = await getCustomerByEmail(email);
  const bookings = await listBookingsByCustomer(email);

  const bundle: ExportBundle = {
    exportedAt: new Date().toISOString(),
    dataController: {
      name: "Trip and Tick",
      contact: "hello@tripandtick.com",
      siteUrl: SITE_URL,
    },
    gdprArticle: "GDPR Madde 15 (verilere erisim hakki) — KVKK Madde 11/b",
    subject: { email },
    customer,
    bookings,
    notes: {
      paymentRecords:
        "Stripe odeme kayitlari finansal kanit zinciri icin Stripe altyapisinda saklanir; talep uzerine email ile saglanir.",
      auditTrail:
        "Webhook olay denetim kayitlari (webhook_events tablosu) PCI-DSS uyum sebebiyle 18 ay tutulur; kisisel veri icermez (yalniz event ID/timestamp).",
      retentionPolicy:
        "Vergi mevzuati geregi (213 sayili VUK) fatura/odeme kayitlari 10 yil saklanir. Diger veriler talep uzerine silinir (GDPR Madde 17).",
    },
  };

  const filename = `tripandtick-gdpr-export-${email.replace(/[^a-z0-9.@-]/gi, "_")}-${Date.now()}.json`;
  return new NextResponse(JSON.stringify(bundle, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
