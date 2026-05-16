// Stripe webhook handler — production payment events.
// User verbatim: "en uzunundan basla, en son benim mudahelem gereken seyleri yap"
//
// Callers: Stripe sunucusu dis-trigger HTTP POST. Frontend cagri yok.
// Glob check: src/app/api/stripe/** bos (no existing webhook).
// Data: Stripe Event JSON (type + data.object); availability-store mutate (slug+date YYYY-MM-DD); Brevo JSON.
//
// Events handled:
//   - checkout.session.completed -> booking confirm mail + availability slot decrement
//   - payment_intent.succeeded -> log
//   - payment_intent.payment_failed -> admin mail
//   - charge.refunded -> customer + admin mail
// Webhook secret yoksa signature bypass + payload process (dev mode).
// Response: 200 OK her zaman (Stripe retry mantigi).

import { NextResponse, type NextRequest } from "next/server";
import { setAvailability, getAvailability } from "@/lib/availability-store";
import { tryClaimEvent } from "@/lib/db/webhook-events";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL ?? "noreply@tripandtick.com";
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME ?? "Trip and Tick";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "info@tripandtick.com";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tripandtick.com";

interface MailInput {
  to: { email: string; name: string };
  subject: string;
  htmlContent: string;
  textContent: string;
  tag: string;
}

async function sendBrevo(input: MailInput): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.info(`[stripe/webhook] BREVO_API_KEY yok — ${input.tag} mail loglandi`, input.to.email, input.subject);
    return false;
  }
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: BREVO_FROM_EMAIL, name: BREVO_FROM_NAME },
        to: [input.to],
        subject: input.subject,
        htmlContent: input.htmlContent,
        textContent: input.textContent,
        tags: ["stripe", input.tag],
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[stripe/webhook] Brevo ${input.tag} hatasi`, res.status, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[stripe/webhook] Brevo ${input.tag} fetch error`, err);
    return false;
  }
}

function paymentFailedMail(opts: { customerEmail: string; amount: string; sessionId?: string }) {
  const html = `<!doctype html><html lang="tr"><body style="font-family:sans-serif;background:#f1f5f9;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:2px solid #ef4444;">
<h2 style="color:#b91c1c;margin:0 0 12px 0;">ODEME BASARISIZ</h2>
<p>Stripe odeme islemi basarisiz oldu.</p>
<table style="width:100%;font-size:14px;margin-top:12px;">
<tr><td style="color:#64748b;padding:4px 0;">Musteri</td><td style="font-weight:600;">${opts.customerEmail || "—"}</td></tr>
<tr><td style="color:#64748b;padding:4px 0;">Tutar</td><td style="font-weight:600;">${opts.amount}</td></tr>
${opts.sessionId ? `<tr><td style="color:#64748b;padding:4px 0;">Session</td><td style="font-family:monospace;font-size:12px;">${opts.sessionId}</td></tr>` : ""}
</table>
<p style="margin-top:16px;color:#475569;">Musteri ile iletisime gecip alternatif odeme yontemi onerin.</p>
</div></body></html>`;
  const text = `ODEME BASARISIZ\n\nMusteri: ${opts.customerEmail}\nTutar: ${opts.amount}\nSession: ${opts.sessionId ?? "—"}\n`;
  return { html, text };
}

function refundCustomerMail(opts: { customerName: string; bookingId?: string; amount: string }) {
  const html = `<!doctype html><html lang="tr"><body style="font-family:sans-serif;background:#f8fafc;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border-left:4px solid #10b981;">
<h2 style="color:#065f46;margin:0 0 12px 0;">Iade Tamamlandi</h2>
<p>Merhaba ${opts.customerName},</p>
<p>Rezervasyonunuz icin iade islemi tamamlandi. Tutar 5-10 is gunu icinde kart ekstresinde gorunecektir.</p>
<table style="width:100%;font-size:14px;margin-top:12px;">
${opts.bookingId ? `<tr><td style="color:#64748b;padding:4px 0;">Rezervasyon</td><td style="font-weight:600;font-family:monospace;">${opts.bookingId}</td></tr>` : ""}
<tr><td style="color:#64748b;padding:4px 0;">Iade tutari</td><td style="font-weight:700;color:#059669;">${opts.amount}</td></tr>
</table>
<p style="margin-top:16px;color:#475569;">Sorulariniz icin: <a href="mailto:${ADMIN_EMAIL}" style="color:#FF6B35;">${ADMIN_EMAIL}</a></p>
<p style="margin-top:8px;color:#94a3b8;font-size:12px;">Trip and Tick · TURSAB lisansli seyahat acentasi</p>
</div></body></html>`;
  const text = `Iade Tamamlandi\n\nMerhaba ${opts.customerName},\nRezervasyonunuz icin iade tamamlandi.\nTutar: ${opts.amount}\n${opts.bookingId ? `Rezervasyon: ${opts.bookingId}\n` : ""}\nIletisim: ${ADMIN_EMAIL}\n`;
  return { html, text };
}

function refundAdminMail(opts: { customerEmail: string; bookingId?: string; amount: string }) {
  const html = `<!doctype html><html lang="tr"><body style="font-family:sans-serif;background:#f1f5f9;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;">
<h2 style="color:#FF6B35;margin:0 0 12px 0;">IADE ISLEMI</h2>
<table style="width:100%;font-size:14px;">
<tr><td style="color:#64748b;padding:4px 0;">Musteri</td><td style="font-weight:600;">${opts.customerEmail}</td></tr>
${opts.bookingId ? `<tr><td style="color:#64748b;padding:4px 0;">Rezervasyon</td><td style="font-weight:600;font-family:monospace;">${opts.bookingId}</td></tr>` : ""}
<tr><td style="color:#64748b;padding:4px 0;">Iade tutari</td><td style="font-weight:700;">${opts.amount}</td></tr>
</table>
</div></body></html>`;
  const text = `IADE ISLEMI\nMusteri: ${opts.customerEmail}\nRezervasyon: ${opts.bookingId ?? "—"}\nTutar: ${opts.amount}\n`;
  return { html, text };
}

function bookingTriggerMail(opts: {
  customerEmail?: string;
  customerName?: string;
  serviceSlug?: string;
  date?: string;
  amount: string;
  sessionId?: string;
}) {
  const html = `<!doctype html><html lang="tr"><body style="font-family:sans-serif;background:#f8fafc;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border-left:4px solid #FFB627;">
<h2 style="color:#1A2B6B;margin:0 0 12px 0;">Odeme Tamamlandi</h2>
<p>Merhaba ${opts.customerName ?? "musafirimiz"},</p>
<p>Stripe odeme isleminiz onaylandi. Rezervasyon detaylariniz ayri bir e-posta ile gonderilecektir.</p>
<table style="width:100%;font-size:14px;margin-top:12px;">
${opts.serviceSlug ? `<tr><td style="color:#64748b;padding:4px 0;">Hizmet</td><td style="font-weight:600;">${opts.serviceSlug}</td></tr>` : ""}
${opts.date ? `<tr><td style="color:#64748b;padding:4px 0;">Tarih</td><td style="font-weight:600;">${opts.date}</td></tr>` : ""}
<tr><td style="color:#64748b;padding:4px 0;">Tutar</td><td style="font-weight:700;color:#FF6B35;">${opts.amount}</td></tr>
</table>
<p style="margin-top:16px;"><a href="${SITE_URL}/hesabim" style="display:inline-block;background:#1A2B6B;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">Rezervasyonumu Goruntule</a></p>
</div></body></html>`;
  const text = `Odeme Tamamlandi\n\nMerhaba ${opts.customerName ?? ""},\nStripe odemeniz onaylandi.\nHizmet: ${opts.serviceSlug ?? "—"}\nTarih: ${opts.date ?? "—"}\nTutar: ${opts.amount}\n\n${SITE_URL}/hesabim\n`;
  return { html, text };
}

function formatAmount(amount: number | null | undefined, currency: string | null | undefined): string {
  if (typeof amount !== "number") return "—";
  const c = (currency ?? "EUR").toUpperCase();
  const symbol = c === "EUR" ? "€" : c === "USD" ? "$" : c === "TRY" ? "₺" : c + " ";
  return `${symbol}${(amount / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Minimal Stripe event shape (avoid full SDK type churn when bypass mode).
interface StripeEvent {
  id?: string;
  type: string;
  data: { object: Record<string, unknown> };
}

// Stripe-Signature header parse: "t=<timestamp>,v1=<hex>"
function parseStripeSignature(header: string): { timestamp: string | null; v1: string | null } {
  const parts = header.split(",").map((p) => p.trim());
  let timestamp: string | null = null;
  let v1: string | null = null;
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const k = part.slice(0, eq);
    const v = part.slice(eq + 1);
    if (k === "t") timestamp = v;
    else if (k === "v1") v1 = v;
  }
  return { timestamp, v1 };
}

// Edge-safe HMAC SHA256 via Web Crypto API.
async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function constructEvent(rawBody: string, signature: string | null): Promise<{ event: StripeEvent | null; verified: boolean; error?: string }> {
  const isProd = process.env.NODE_ENV === "production";
  if (!STRIPE_WEBHOOK_SECRET || !signature) {
    if (isProd) {
      return { event: null, verified: false, error: "signature required in production" };
    }
    // Dev / bypass mode — parse JSON, no signature verify.
    try {
      const parsed = JSON.parse(rawBody) as StripeEvent;
      return { event: parsed, verified: false };
    } catch (err) {
      return { event: null, verified: false, error: err instanceof Error ? err.message : "JSON parse error" };
    }
  }
  try {
    const { timestamp, v1 } = parseStripeSignature(signature);
    if (!timestamp || !v1) {
      return { event: null, verified: false, error: "signature header parse failed" };
    }
    const expected = await hmacSha256Hex(STRIPE_WEBHOOK_SECRET, `${timestamp}.${rawBody}`);
    if (!timingSafeEqual(expected, v1)) {
      return { event: null, verified: false, error: "signature mismatch" };
    }
    // Replay protection: 5 dakikadan eski timestamp reddedilir.
    const age = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
    if (Number.isFinite(age) && age > 300) {
      return { event: null, verified: false, error: "timestamp outside tolerance" };
    }
    const event = JSON.parse(rawBody) as StripeEvent;
    return { event, verified: true };
  } catch (err) {
    return { event: null, verified: false, error: err instanceof Error ? err.message : "Signature verify failed" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    const { event, verified, error } = await constructEvent(rawBody, signature);

    if (!event) {
      console.error("[stripe/webhook] event parse/verify failed", error);
      return NextResponse.json({ received: false, error: error ?? "parse failed" }, { status: 200 });
    }

    console.info(`[stripe/webhook] event=${event.type} verified=${verified} id=${event.id ?? "?"}`);

    if (event.id) {
      const claimed = await tryClaimEvent("stripe", event.id, event.type);
      if (!claimed) {
        console.info(`[stripe/webhook] duplicate event skip id=${event.id}`);
        return NextResponse.json({ received: true, verified, duplicate: true, type: event.type }, { status: 200 });
      }
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          id?: string;
          customer_email?: string | null;
          customer_details?: { email?: string | null; name?: string | null } | null;
          amount_total?: number | null;
          currency?: string | null;
          metadata?: Record<string, string> | null;
        };
        const meta = session.metadata ?? {};
        const customerEmail = session.customer_email ?? session.customer_details?.email ?? "";
        const customerName = session.customer_details?.name ?? "";
        const amount = formatAmount(session.amount_total, session.currency);
        const serviceSlug = meta.serviceSlug;
        const date = meta.date;

        // Availability slot -1 (mock).
        if (serviceSlug && date) {
          try {
            const current = getAvailability(serviceSlug, date);
            const newRemaining = Math.max(0, current.remainingSlots - 1);
            setAvailability(serviceSlug, date, { remainingSlots: newRemaining });
            console.info(`[stripe/webhook] availability ${serviceSlug}@${date} ${current.remainingSlots}->${newRemaining}`);
          } catch (err) {
            console.warn("[stripe/webhook] availability update failed", err);
          }
        }

        if (customerEmail) {
          const tpl = bookingTriggerMail({
            customerEmail,
            customerName: customerName || "musafirimiz",
            serviceSlug,
            date,
            amount,
            sessionId: session.id,
          });
          await sendBrevo({
            to: { email: customerEmail, name: customerName || "Musafir" },
            subject: "Odeme Onayi — Trip and Tick",
            htmlContent: tpl.html,
            textContent: tpl.text,
            tag: "payment-success",
          });
        }
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as { id?: string; amount?: number | null; currency?: string | null };
        console.info(`[stripe/webhook] payment_intent.succeeded ${pi.id} ${formatAmount(pi.amount, pi.currency)}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as {
          id?: string;
          amount?: number | null;
          currency?: string | null;
          last_payment_error?: { message?: string } | null;
          receipt_email?: string | null;
        };
        const amount = formatAmount(pi.amount, pi.currency);
        const tpl = paymentFailedMail({
          customerEmail: pi.receipt_email ?? "—",
          amount,
          sessionId: pi.id,
        });
        await sendBrevo({
          to: { email: ADMIN_EMAIL, name: "Trip and Tick" },
          subject: `ODEME BASARISIZ — ${amount}`,
          htmlContent: tpl.html,
          textContent: tpl.text,
          tag: "payment-failed",
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as {
          id?: string;
          amount_refunded?: number | null;
          currency?: string | null;
          billing_details?: { email?: string | null; name?: string | null } | null;
          metadata?: Record<string, string> | null;
        };
        const customerEmail = charge.billing_details?.email ?? "";
        const customerName = charge.billing_details?.name ?? "musafirimiz";
        const amount = formatAmount(charge.amount_refunded, charge.currency);
        const bookingId = charge.metadata?.bookingId;

        if (customerEmail) {
          const customerTpl = refundCustomerMail({ customerName, bookingId, amount });
          await sendBrevo({
            to: { email: customerEmail, name: customerName },
            subject: `Iade Tamamlandi — Trip and Tick`,
            htmlContent: customerTpl.html,
            textContent: customerTpl.text,
            tag: "refund-customer",
          });
        }
        const adminTpl = refundAdminMail({ customerEmail: customerEmail || "—", bookingId, amount });
        await sendBrevo({
          to: { email: ADMIN_EMAIL, name: "Trip and Tick" },
          subject: `IADE — ${amount} — ${bookingId ?? charge.id ?? ""}`,
          htmlContent: adminTpl.html,
          textContent: adminTpl.text,
          tag: "refund-admin",
        });
        break;
      }

      default:
        console.info(`[stripe/webhook] unhandled event ${event.type}`);
    }

    return NextResponse.json({ received: true, verified, type: event.type }, { status: 200 });
  } catch (err) {
    console.error("[stripe/webhook] fatal", err);
    return NextResponse.json({ received: false, error: "internal" }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "stripe webhook endpoint alive" });
}
