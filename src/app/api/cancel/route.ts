// Booking cancel-request endpoint.
// User verbatim: "en uzunundan basla, en son benim mudahelem gereken seyleri yap"
//
// Callers: src/app/hesabim/page.tsx ("Iptal Talep Et" butonu — fetch POST).
// Glob check: src/app/api/cancel/** previously empty.
// Data: POST JSON { bookingId TT-XXXXXXXX, email, reason?, bookingDate YYYY-MM-DD?, totalPrice?, currency?, serviceName? }
// Iptal politikasi: >=72h %100 / 24-72h %50 / <24h %0. Brevo admin mail (no file I/O).

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cancelSchema = z.object({
  bookingId: z.string().regex(/^TT-[A-Z0-9]{6,12}$/, "Gecersiz rezervasyon kodu"),
  email: z.string().email("Gecersiz e-posta"),
  reason: z.string().max(1000).optional(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  totalPrice: z.number().nonnegative().optional(),
  currency: z.enum(["EUR", "TRY", "USD"]).optional(),
  serviceName: z.string().max(200).optional(),
});

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL ?? "noreply@tripandtick.com";
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME ?? "Trip and Tick";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "info@tripandtick.com";

function refundPolicy(bookingDateIso?: string): { hoursUntil: number; pct: number; days: number } {
  if (!bookingDateIso) return { hoursUntil: Infinity, pct: 100, days: 5 };
  const now = Date.now();
  const bookingTime = new Date(bookingDateIso + "T05:00:00+03:00").getTime();
  if (isNaN(bookingTime)) return { hoursUntil: Infinity, pct: 100, days: 5 };
  const hoursUntil = (bookingTime - now) / (1000 * 60 * 60);
  if (hoursUntil >= 72) return { hoursUntil, pct: 100, days: 5 };
  if (hoursUntil >= 24) return { hoursUntil, pct: 50, days: 7 };
  return { hoursUntil, pct: 0, days: 0 };
}

async function sendAdminCancelMail(input: {
  bookingId: string;
  email: string;
  reason?: string;
  serviceName?: string;
  bookingDate?: string;
  refundPct: number;
  refundAmount: number;
  currency: string;
}): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.info("[api/cancel] BREVO_API_KEY yok — admin mail loglandi", JSON.stringify(input));
    return false;
  }
  const sym = input.currency === "EUR" ? "€" : input.currency === "USD" ? "$" : input.currency === "TRY" ? "₺" : input.currency + " ";
  const html = `<!doctype html><html lang="tr"><body style="font-family:sans-serif;background:#f1f5f9;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border-left:4px solid #ef4444;">
<h2 style="color:#b91c1c;margin:0 0 12px 0;">IPTAL TALEBI</h2>
<table style="width:100%;font-size:14px;">
<tr><td style="color:#64748b;padding:4px 0;">Rezervasyon</td><td style="font-weight:700;font-family:monospace;">${input.bookingId}</td></tr>
<tr><td style="color:#64748b;padding:4px 0;">Musteri</td><td style="font-weight:600;">${input.email}</td></tr>
${input.serviceName ? `<tr><td style="color:#64748b;padding:4px 0;">Hizmet</td><td style="font-weight:600;">${input.serviceName}</td></tr>` : ""}
${input.bookingDate ? `<tr><td style="color:#64748b;padding:4px 0;">Ucus tarihi</td><td style="font-weight:600;">${input.bookingDate}</td></tr>` : ""}
<tr><td style="color:#64748b;padding:4px 0;">Iade orani</td><td style="font-weight:700;color:#FF6B35;">%${input.refundPct}</td></tr>
<tr><td style="color:#64748b;padding:4px 0;">Iade tutari</td><td style="font-weight:700;">${sym}${input.refundAmount.toFixed(2)}</td></tr>
</table>
${input.reason ? `<div style="margin-top:14px;padding:10px 12px;background:#fffbeb;border-left:3px solid #FFB627;border-radius:4px;font-size:13px;color:#78350f;"><strong>Sebep:</strong> ${input.reason}</div>` : ""}
<p style="margin-top:16px;color:#475569;">Stripe panel uzerinden refund tetiklenmelidir.</p>
</div></body></html>`;
  const text = `IPTAL TALEBI\n\nRezervasyon: ${input.bookingId}\nMusteri: ${input.email}\nHizmet: ${input.serviceName ?? "—"}\nUcus tarihi: ${input.bookingDate ?? "—"}\nIade orani: %${input.refundPct}\nIade tutari: ${sym}${input.refundAmount.toFixed(2)}\nSebep: ${input.reason ?? "—"}\n`;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { email: BREVO_FROM_EMAIL, name: BREVO_FROM_NAME },
        to: [{ email: ADMIN_EMAIL, name: "Trip and Tick" }],
        replyTo: { email: input.email },
        subject: `IPTAL TALEBI — ${input.bookingId} (%${input.refundPct} iade)`,
        htmlContent: html,
        textContent: text,
        tags: ["cancel-request"],
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[api/cancel] Brevo error", err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = cancelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Gecersiz veri", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const policy = refundPolicy(data.bookingDate);
    const totalPrice = data.totalPrice ?? 0;
    const refundAmount = (totalPrice * policy.pct) / 100;

    const mailSent = await sendAdminCancelMail({
      bookingId: data.bookingId,
      email: data.email,
      reason: data.reason,
      serviceName: data.serviceName,
      bookingDate: data.bookingDate,
      refundPct: policy.pct,
      refundAmount,
      currency: data.currency ?? "EUR",
    });

    console.info("[api/cancel] iptal talebi", JSON.stringify({ ...data, refundPct: policy.pct, refundAmount, mailSent }));

    return NextResponse.json({
      cancelled: true,
      refundPct: policy.pct,
      refundAmount,
      refundDays: policy.days,
      hoursUntil: Math.max(0, Math.round(policy.hoursUntil)),
      message:
        policy.pct === 100
          ? "Iptal talebiniz alindi. Tam iade 3-5 is gunu icinde kartiniza yansiyacaktir."
          : policy.pct === 50
            ? "Iptal talebiniz alindi. Politika geregi %50 iade uygulanacaktir."
            : "Iptal talebiniz alindi. Ucus tarihinizi 24 saatten az kaldigi icin iade yapilamamaktadir.",
    });
  } catch (err) {
    console.error("[api/cancel] error", err);
    return NextResponse.json({ error: "Iptal talebi kaydedilemedi" }, { status: 500 });
  }
}
