// /api/hotel-inquiry — otel info-only flow form submit.
//
// Importers (callers):
//   - src/components/oteller/HotelInquiryForm.tsx
//   - /oteller/[slug] sayfasi (inline form)
// Affected: Brevo mail admin'e + musteri auto-confirm. Otel rezervasyonu yapilmaz,
//           sadece bilgilendirme — sonrasinda telefon ile yardim.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const inquirySchema = z.object({
  hotelSlug: z.string().min(1).max(80),
  hotelName: z.string().min(1).max(200),
  name: z.string().min(2, "Ad zorunlu").max(100),
  email: z.string().email("Geçerli e-posta girin"),
  phone: z.string().min(7, "Telefon zorunlu (sizi arayacagiz)").max(40),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Giris tarihi YYYY-MM-DD"),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Cikis tarihi YYYY-MM-DD"),
  adults: z.number().int().min(1).max(20),
  children: z.number().int().min(0).max(10).optional().default(0),
  tier: z.enum(["budget", "mid", "lux"]).optional(),
  region: z.string().max(80).optional(),
  budget: z.string().max(100).optional(),
  preferences: z.string().max(2000).optional(),
  _hp: z.string().optional(),
});

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL ?? "hello@tripandtick.com";
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME ?? "Trip and Tick";
const BREVO_TO_EMAIL = process.env.BREVO_TO_EMAIL ?? "hello@tripandtick.com";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function tierLabel(tier?: string): string {
  if (tier === "budget") return "Ucuz / Ekonomik";
  if (tier === "mid") return "Orta Halli";
  if (tier === "lux") return "Lüks / Premium";
  return "—";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz form verisi", details: parsed.error.flatten() }, { status: 400 });
    }
    if (parsed.data._hp && parsed.data._hp.trim().length > 0) {
      console.warn("[api/hotel-inquiry] Honeypot tetiklendi");
      return NextResponse.json({ success: true });
    }

    const d = parsed.data;
    const inquiryId = `HI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const adminHtml = `
      <h2>Yeni Otel Bilgi Talebi (${escapeHtml(inquiryId)})</h2>
      <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
        <tr><td style="padding:4px 8px"><b>Otel</b></td><td>${escapeHtml(d.hotelName)} <code style="color:#888">(${escapeHtml(d.hotelSlug)})</code></td></tr>
        <tr><td style="padding:4px 8px"><b>Segment</b></td><td>${escapeHtml(tierLabel(d.tier))}</td></tr>
        ${d.region ? `<tr><td style="padding:4px 8px"><b>Bölge</b></td><td>${escapeHtml(d.region)}</td></tr>` : ""}
        <tr><td style="padding:4px 8px"><b>Müşteri</b></td><td>${escapeHtml(d.name)}</td></tr>
        <tr><td style="padding:4px 8px"><b>E-posta</b></td><td><a href="mailto:${escapeHtml(d.email)}">${escapeHtml(d.email)}</a></td></tr>
        <tr><td style="padding:4px 8px"><b>Telefon</b></td><td><a href="tel:${escapeHtml(d.phone)}">${escapeHtml(d.phone)}</a></td></tr>
        <tr><td style="padding:4px 8px"><b>Giriş</b></td><td>${escapeHtml(d.checkIn)}</td></tr>
        <tr><td style="padding:4px 8px"><b>Çıkış</b></td><td>${escapeHtml(d.checkOut)}</td></tr>
        <tr><td style="padding:4px 8px"><b>Misafirler</b></td><td>${d.adults} yetişkin${d.children ? ` + ${d.children} çocuk` : ""}</td></tr>
        ${d.budget ? `<tr><td style="padding:4px 8px"><b>Bütçe</b></td><td>${escapeHtml(d.budget)}</td></tr>` : ""}
      </table>
      ${d.preferences ? `<h3>Tercihler / Not</h3><pre style="white-space:pre-wrap;font-family:inherit;background:#f5f5f5;padding:10px;border-radius:6px">${escapeHtml(d.preferences)}</pre>` : ""}
      <hr>
      <p style="font-size:12px;color:#666">Aksiyon: müşteriyi telefon (<b>${escapeHtml(d.phone)}</b>) veya e-posta ile arayın, uygun otel + fiyat teklifi gönderin.</p>
    `;

    const customerHtml = `
      <h2>Otel Bilgi Talebiniz Alındı</h2>
      <p>Merhaba ${escapeHtml(d.name)},</p>
      <p><b>${escapeHtml(d.hotelName)}</b> için bilgi talebiniz tarafımıza ulaştı. 24 saat içinde sizi telefon veya e-posta ile arayarak uygun seçenekler ve fiyat teklifi paylaşacağız.</p>
      <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;margin:12px 0">
        <tr><td style="padding:4px 8px;color:#666">Talep No</td><td><b>${escapeHtml(inquiryId)}</b></td></tr>
        <tr><td style="padding:4px 8px;color:#666">Otel</td><td>${escapeHtml(d.hotelName)}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Tarihler</td><td>${escapeHtml(d.checkIn)} → ${escapeHtml(d.checkOut)}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Misafir</td><td>${d.adults} yetişkin${d.children ? ` + ${d.children} çocuk` : ""}</td></tr>
      </table>
      <p>Acil iletişim: <a href="tel:+905374647861">+90 537 464 78 61</a> · <a href="https://wa.me/905374647861">WhatsApp</a></p>
      <p style="color:#888;font-size:12px">Trip and Tick · Kapadokya · tripandtick.com</p>
    `;

    if (BREVO_API_KEY) {
      const send = async (to: { email: string; name: string }, subject: string, html: string, replyTo?: { email: string; name: string }) => {
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": BREVO_API_KEY!, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            sender: { email: BREVO_FROM_EMAIL, name: BREVO_FROM_NAME },
            to: [to],
            replyTo,
            subject,
            htmlContent: html,
          }),
        });
        if (!res.ok) {
          const txt = await res.text();
          console.error("[api/hotel-inquiry] Brevo gonderim hata", res.status, txt);
        }
        return res.ok;
      };

      const adminOk = await send(
        { email: BREVO_TO_EMAIL, name: "Trip and Tick" },
        `[Otel Talebi] ${d.hotelName} — ${d.name} (${d.checkIn} → ${d.checkOut})`,
        adminHtml,
        { email: d.email, name: d.name }
      );
      const customerOk = await send(
        { email: d.email, name: d.name },
        `Otel bilgi talebiniz alındı — ${d.hotelName}`,
        customerHtml
      );

      return NextResponse.json({
        success: true,
        inquiryId,
        emailSent: { admin: adminOk, customer: customerOk },
        message: "Talebiniz alındı. 24 saat içinde size dönüş yapılacak.",
      });
    }

    console.info("[api/hotel-inquiry] BREVO_API_KEY yok — sadece log", JSON.stringify({ inquiryId, ...d }));
    return NextResponse.json({
      success: true,
      inquiryId,
      emailSent: { admin: false, customer: false },
      message: "Talebiniz alındı (demo log).",
    });
  } catch (err) {
    console.error("[api/hotel-inquiry] error", err);
    return NextResponse.json({ error: "Talep gönderilemedi. Lütfen tekrar deneyin." }, { status: 500 });
  }
}
