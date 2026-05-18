// /api/gdpr/delete — user-initiated personal data erasure (GDPR Madde 17).
//
// GET ?token=...      -> verify HMAC + render confirmation HTML page (POST form).
// POST ?token=...     -> execute erasure (pseudonymize bookings + delete customer +
//                        remove Brevo contact).
//
// Retention exception (legal hold):
//   - bookings rows kept (legal/tax/Stripe linkage) BUT passengers JSONB and
//     special_requests are pseudonymized in-place; customer_id set NULL.
//   - Stripe payment records: out-of-band (Stripe owns retention).
//   - webhook_events: kept (no PII; PCI audit trail 18 months).

import { NextResponse, type NextRequest } from "next/server";
import { verifyGdprToken } from "@/lib/gdpr-token";
import { supabaseAdmin, supabaseEnabled } from "@/lib/supabase";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tripandtick.com";
const BREVO_API_KEY = process.env.BREVO_API_KEY;

const REDACTED_PASSENGER = {
  fullName: "(silinmis)",
  email: "(silinmis)",
  phone: "(silinmis)",
  nationality: null as unknown,
  age: null as unknown,
};

interface EraseResult {
  customerDeleted: boolean;
  bookingsPseudonymized: number;
  brevoContactRemoved: boolean;
  notes: string[];
}

async function eraseUserData(email: string): Promise<EraseResult> {
  const notes: string[] = [];
  const result: EraseResult = {
    customerDeleted: false,
    bookingsPseudonymized: 0,
    brevoContactRemoved: false,
    notes,
  };

  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    notes.push("Supabase env yok — gercek erasure yapilamadi (demo log only).");
    console.info("[api/gdpr/delete] mock erase", { email });
  } else {
    const { data: customer } = await client
      .from("customers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (customer?.id) {
      const { data: customerBookings } = await client
        .from("bookings")
        .select("id, passengers")
        .eq("customer_id", customer.id);
      if (Array.isArray(customerBookings) && customerBookings.length > 0) {
        for (const b of customerBookings as Array<{ id: string; passengers: unknown }>) {
          const pCount = Array.isArray(b.passengers) ? b.passengers.length : 1;
          const redactedArr = Array.from({ length: pCount }, (_, i) => {
            const orig = Array.isArray(b.passengers) ? b.passengers[i] : null;
            return {
              ...REDACTED_PASSENGER,
              nationality:
                orig && typeof orig === "object" && "nationality" in orig
                  ? (orig as { nationality: unknown }).nationality
                  : null,
              age:
                orig && typeof orig === "object" && "age" in orig
                  ? (orig as { age: unknown }).age
                  : null,
            };
          });
          const { error: upErr } = await client
            .from("bookings")
            .update({
              passengers: redactedArr,
              special_requests: null,
              customer_id: null,
            })
            .eq("id", b.id);
          if (upErr) {
            notes.push(`Booking ${b.id} pseudonymize failed: ${upErr.message}`);
          } else {
            result.bookingsPseudonymized += 1;
          }
        }
      }

      const { error: delErr } = await client
        .from("customers")
        .delete()
        .eq("id", customer.id);
      if (delErr) {
        notes.push(`Customer delete failed: ${delErr.message}`);
      } else {
        result.customerDeleted = true;
      }
    } else {
      notes.push("Customer kaydi bulunamadi (zaten yok veya silinmis).");
    }

    const { data: orphanBookings } = await client
      .from("bookings")
      .select("id, passengers")
      .is("customer_id", null);
    if (Array.isArray(orphanBookings)) {
      for (const b of orphanBookings as Array<{ id: string; passengers: unknown }>) {
        const arr = Array.isArray(b.passengers) ? b.passengers : [];
        const match = arr.some(
          (p) =>
            p &&
            typeof p === "object" &&
            "email" in p &&
            String((p as { email: unknown }).email ?? "").toLowerCase() === email
        );
        if (!match) continue;
        const redacted = arr.map((p) => ({
          ...REDACTED_PASSENGER,
          nationality:
            p && typeof p === "object" && "nationality" in p
              ? (p as { nationality: unknown }).nationality
              : null,
          age:
            p && typeof p === "object" && "age" in p
              ? (p as { age: unknown }).age
              : null,
        }));
        const { error: upErr } = await client
          .from("bookings")
          .update({ passengers: redacted, special_requests: null })
          .eq("id", b.id);
        if (!upErr) result.bookingsPseudonymized += 1;
      }
    }
  }

  if (BREVO_API_KEY) {
    try {
      const res = await fetch(
        `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: { "api-key": BREVO_API_KEY, Accept: "application/json" },
        }
      );
      if (res.ok || res.status === 404) {
        result.brevoContactRemoved = true;
      } else {
        notes.push(`Brevo delete failed: ${res.status}`);
      }
    } catch (err) {
      notes.push(
        `Brevo delete error: ${err instanceof Error ? err.message : "unknown"}`
      );
    }
  } else {
    notes.push("Brevo env yok — newsletter contact temizligi atlandi (demo).");
  }

  return result;
}

function htmlError(status: number, title: string, message: string) {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>${esc(title)} — Trip and Tick</title><meta name="robots" content="noindex,nofollow"></head><body style="font-family:system-ui,sans-serif;max-width:560px;margin:48px auto;padding:24px;color:#1e293b"><h1 style="color:#dc2626">${esc(title)}</h1><p>${esc(message)}</p><p><a href="${SITE_URL}/gdpr">Yeni bag iste</a> &middot; <a href="${SITE_URL}">Ana sayfaya don</a></p></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function htmlConfirm(email: string, token: string) {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Veri Silme Onayi — Trip and Tick</title><meta name="robots" content="noindex,nofollow"><style>body{font-family:system-ui,sans-serif;max-width:600px;margin:32px auto;padding:24px;color:#1e293b}.warn{background:#fef3c7;border:1px solid #f59e0b;padding:16px;border-radius:8px;color:#92400e}.danger{background:#dc2626;color:#fff;padding:14px 28px;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer}.danger:hover{background:#b91c1c}</style></head><body><h1 style="color:#dc2626">Veri Silme Onayi</h1><p><strong>${esc(email)}</strong> ile iliskili kisisel veriler silinecek.</p><div class="warn"><p><strong>Bu islem geri alinamaz.</strong></p><ul style="margin:8px 0 0 16px"><li>Hesap profili (musteri kayd) silinir</li><li>Rezervasyon yolcu bilgileri (ad, e-posta, telefon) anonimlestirilir</li><li>Newsletter aboneligi iptal edilir (Brevo)</li><li>Vergi mevzuati geregi fatura kayitlari (10 yil) ve Stripe odeme zinciri sistemde kalmaya devam eder</li></ul></div><form method="POST" action="/api/gdpr/delete?token=${esc(token)}" style="margin-top:32px"><button class="danger" type="submit">Evet, verilerimi sil</button> <a href="${SITE_URL}" style="margin-left:16px;color:#64748b">Vazgec</a></form><p style="color:#64748b;font-size:12px;margin-top:32px">Trip and Tick · GDPR Madde 17 / KVKK Madde 11/e</p></body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex,nofollow" },
  });
}

function htmlSuccess(email: string, result: EraseResult) {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const notes = result.notes.length
    ? `<details style="margin-top:16px"><summary style="cursor:pointer;color:#64748b">Teknik notlar</summary><ul>${result.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul></details>`
    : "";
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"><title>Veriler silindi — Trip and Tick</title><meta name="robots" content="noindex,nofollow"></head><body style="font-family:system-ui,sans-serif;max-width:560px;margin:48px auto;padding:24px;color:#1e293b"><h1 style="color:#16a34a">Tamamlandi</h1><p><strong>${esc(email)}</strong> icin GDPR Madde 17 silme talebi islendi.</p><ul><li>Hesap profili: ${result.customerDeleted ? "silindi" : "kaydi yoktu"}</li><li>Rezervasyon anonimlestirme: ${result.bookingsPseudonymized} kayit</li><li>Newsletter aboneligi: ${result.brevoContactRemoved ? "kaldirildi" : "atlandi/yok"}</li></ul>${notes}<p style="color:#64748b;font-size:14px;margin-top:24px">Geri kalan kayitlar (Stripe odeme + 10 yil vergi mevzuati) talep uzerine <a href="mailto:hello@tripandtick.com">hello@tripandtick.com</a> ile silinebilir.</p><p><a href="${SITE_URL}" style="display:inline-block;background:#1e40af;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;margin-top:16px">Ana sayfa</a></p></body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex,nofollow" },
  });
}

type ExtractResult =
  | { ok: false; error: string }
  | { ok: true; email: string; token: string };

async function verifyAndExtract(req: NextRequest): Promise<ExtractResult> {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return { ok: false, error: "Bag eksik. Token parametresi yok." };
  const result = await verifyGdprToken(token);
  if (!result.valid || !result.payload) {
    return {
      ok: false,
      error:
        result.error === "expired"
          ? "Bag suresi doldu (24 saat). Yeni bir bag isteyin."
          : "Gecersiz veya bozuk bag.",
    };
  }
  if (result.payload.action !== "delete") {
    return {
      ok: false,
      error: "Bu bag silme islemi icin degil. Yeni bir silme bag isteyin.",
    };
  }
  return { ok: true, email: result.payload.email, token };
}

export async function GET(req: NextRequest) {
  const v = await verifyAndExtract(req);
  if (!v.ok) return htmlError(403, "Erisim reddedildi", v.error);
  return htmlConfirm(v.email, v.token);
}

export async function POST(req: NextRequest) {
  const v = await verifyAndExtract(req);
  if (!v.ok) return htmlError(403, "Erisim reddedildi", v.error);
  const result = await eraseUserData(v.email);
  console.info("[api/gdpr/delete] erasure", {
    email: v.email,
    customerDeleted: result.customerDeleted,
    bookingsPseudonymized: result.bookingsPseudonymized,
    brevoContactRemoved: result.brevoContactRemoved,
  });
  return htmlSuccess(v.email, result);
}
