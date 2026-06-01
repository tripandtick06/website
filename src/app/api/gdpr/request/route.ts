// /api/gdpr/request — user-initiated GDPR magic-link request.
//
// POST body: { email: string, action: "export" | "delete" }
// Response: 200 generic confirmation (no enumeration of accounts).
// Effect: signs a 24h HMAC token + sends Brevo email with link.
// Rate-limit: best-effort in-memory (per IP+email, 5/hour).
//
// Caller (UI): src/app/[locale]/gdpr/page.tsx form submit.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { signGdprToken, buildGdprLinkUrl, type GdprAction } from "@/lib/gdpr-token";
import { sendBrevoEmail } from "@/lib/brevo";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tripandtick.com";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  action: z.enum(["export", "delete"]),
});

const RATE_BUCKET = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 5;

function rateLimit(ip: string, email: string): boolean {
  const key = `${ip}|${email}`;
  const now = Date.now();
  const entry = RATE_BUCKET.get(key);
  if (!entry || entry.resetAt < now) {
    RATE_BUCKET.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_MAX) return false;
  entry.count += 1;
  return true;
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function buildEmailHtml(action: GdprAction, link: string, email: string): string {
  const actionTr = action === "export" ? "verilerinizi indirme" : "veri silme";
  const actionTitle = action === "export" ? "Veri Disa Aktarma" : "Veri Silme";
  const cautionDelete =
    action === "delete"
      ? `<p style="background:#fef3c7;border:1px solid #f59e0b;padding:12px;border-radius:8px;color:#92400e"><strong>Uyari:</strong> Bu link kullanildiginda <strong>${email}</strong> ile iliskili rezervasyon ve hesap verileri kalici olarak silinecektir. Tamamlanmis Stripe odeme kayitlari vergi mevzuati geregi 10 yil saklanir.</p>`
      : "";
  return `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8"></head><body style="font-family:system-ui,sans-serif;max-width:560px;margin:32px auto;color:#1e293b">
<h1 style="color:#1e40af">${actionTitle} — Trip and Tick</h1>
<p>Merhaba,</p>
<p><strong>${email}</strong> e-posta adresi icin ${actionTr} talebi aldik.</p>
<p>Asagidaki bagi tiklayarak islemi onaylayabilirsiniz:</p>
<p style="margin:24px 0"><a href="${link}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">${actionTitle} islemini onayla</a></p>
${cautionDelete}
<p style="color:#64748b;font-size:14px">Bag <strong>24 saat</strong> gecerlidir. Bu talebi siz yapmadiysaniz e-postayi yok sayabilirsiniz.</p>
<p style="color:#64748b;font-size:12px;margin-top:32px">Trip and Tick · Nevsehir, Kapadokya · GDPR Madde 15 (verilere erisim) ve Madde 17 (silme hakki).</p>
</body></html>`;
}

function buildEmailText(action: GdprAction, link: string, email: string): string {
  const actionTr = action === "export" ? "verilerinizi indirme" : "veri silme";
  const actionTitle = action === "export" ? "Veri Disa Aktarma" : "Veri Silme";
  const cautionDelete =
    action === "delete"
      ? `\nUYARI: Bu link kullanildiginda ${email} ile iliskili rezervasyon ve hesap verileri kalici silinir. Tamamlanmis Stripe odeme kayitlari vergi mevzuati geregi 10 yil saklanir.\n`
      : "";
  return `${actionTitle} — Trip and Tick

Merhaba,

${email} icin ${actionTr} talebi aldik. Asagidaki bagi tiklayin:

${link}
${cautionDelete}
Bag 24 saat gecerlidir. Bu talebi siz yapmadiysaniz bu e-postayi yok sayabilirsiniz.

Trip and Tick · GDPR Madde 15/17`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Gecersiz JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Gecersiz e-posta veya islem turu" },
      { status: 400 }
    );
  }
  const { email, action } = parsed.data;

  const ip = clientIp(req);
  if (!rateLimit(ip, email)) {
    return NextResponse.json(
      { error: "Cok fazla istek. Lutfen 1 saat sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  const token = await signGdprToken({ email, action });
  const link = buildGdprLinkUrl(SITE_URL, action, token);

  const actionTitle = action === "export" ? "Veri Disa Aktarma" : "Veri Silme";
  const sendResult = await sendBrevoEmail({
    to: { email },
    subject: `${actionTitle} — Trip and Tick`,
    htmlContent: buildEmailHtml(action, link, email),
    textContent: buildEmailText(action, link, email),
    tags: ["gdpr", `gdpr-${action}`, "transactional"],
  });

  return NextResponse.json({
    ok: true,
    message:
      "Eger bu e-posta sistemimizde kayitliysa, onayli bag gonderdik. Posta kutunuzu (ve spam klasorunu) kontrol edin.",
    emailSent: sendResult.ok,
    demoLogged: sendResult.demoLogged ?? false,
  });
}
