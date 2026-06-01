// /api/admin/reschedule — Q3 Balon borsasi: bulk-cancel sonrasi alt-tarih / refund
// magic-link batch e-posta gonderim + preview.
//
// Importers (callers):
//   - src/app/admin/fiyat/page.tsx (preview + send button)
// Auth: x-admin-token header ADMIN_API_TOKEN env eslesme.
//
// Modes:
//   - preview: { mode:"preview", slugs[], date } -> impactedBookings + alternativeDates
//   - send   : { mode:"send", slugs[], date, cancellationReason } -> Brevo batch + magic-link

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { findImpactedBookings, type ImpactedBooking } from "@/lib/db/bookings";
import { listOverrides } from "@/lib/db/service-overrides";
import { signRescheduleToken } from "@/lib/reschedule-token";
import { sendBrevoBatch, brevoEnabled } from "@/lib/brevo";
import {
  rescheduleBatchEmailHtml,
  rescheduleBatchEmailText,
} from "@/lib/email-templates";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN ?? "demo-admin-token-rotate-me";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tripandtick.com";
const TTL_DAYS = 14;
const ALT_LOOKAHEAD_DAYS = 14;
const MAX_ALTERNATIVES = 5;

function authorized(req: NextRequest): boolean {
  const tok = req.headers.get("x-admin-token");
  return Boolean(tok) && tok === ADMIN_TOKEN;
}

const previewSchema = z.object({
  mode: z.literal("preview"),
  slugs: z.array(z.string().min(1)).min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const sendSchema = z.object({
  mode: z.literal("send"),
  slugs: z.array(z.string().min(1)).min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cancellationReason: z.string().min(2).max(500).optional(),
  locale: z.string().min(2).max(8).optional(),
});

function isoAddDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function suggestAlternativeDates(slug: string, fromDate: string): Promise<string[]> {
  const start = isoAddDays(fromDate, 1);
  const end = isoAddDays(fromDate, ALT_LOOKAHEAD_DAYS);
  const overrides = await listOverrides({ slug, startDate: start, endDate: end });
  const blocked = new Set(
    overrides
      .filter((o) => o.status === "cancelled" || o.status === "sold_out")
      .map((o) => o.date)
  );
  const candidates: string[] = [];
  for (let i = 1; i <= ALT_LOOKAHEAD_DAYS && candidates.length < MAX_ALTERNATIVES; i++) {
    const d = isoAddDays(fromDate, i);
    if (!blocked.has(d)) candidates.push(d);
  }
  return candidates;
}

interface BookingWithAlternatives extends ImpactedBooking {
  alternativeDates: string[];
}

async function enrichWithAlternatives(
  bookings: ImpactedBooking[]
): Promise<BookingWithAlternatives[]> {
  const cache = new Map<string, string[]>();
  const out: BookingWithAlternatives[] = [];
  for (const b of bookings) {
    const key = `${b.serviceSlug}:${b.date}`;
    let alts = cache.get(key);
    if (!alts) {
      alts = await suggestAlternativeDates(b.serviceSlug, b.date);
      cache.set(key, alts);
    }
    out.push({ ...b, alternativeDates: alts });
  }
  return out;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON parse hatasi" }, { status: 400 });
  }

  const mode = (body as { mode?: string })?.mode;

  if (mode === "preview") {
    const parsed = previewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Gecersiz preview verisi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const impacted = await findImpactedBookings({
      slugs: parsed.data.slugs,
      date: parsed.data.date,
    });
    const enriched = await enrichWithAlternatives(impacted);
    return NextResponse.json({
      ok: true,
      mode: "preview",
      count: enriched.length,
      totalPax: enriched.reduce((sum, b) => sum + b.pax, 0),
      totalRefund: enriched.reduce((sum, b) => sum + b.total, 0),
      currency: enriched[0]?.currency ?? "EUR",
      bookings: enriched,
    });
  }

  if (mode === "send") {
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Gecersiz send verisi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const impacted = await findImpactedBookings({
      slugs: parsed.data.slugs,
      date: parsed.data.date,
    });
    if (impacted.length === 0) {
      return NextResponse.json({
        ok: true,
        mode: "send",
        count: 0,
        sent: 0,
        message: "Etkilenen rezervasyon yok.",
      });
    }
    const enriched = await enrichWithAlternatives(impacted);
    const locale = parsed.data.locale ?? "tr";

    const emailInputs = await Promise.all(
      enriched
        .filter((b) => b.customerEmail && b.customerEmail.includes("@"))
        .map(async (b) => {
          const token = await signRescheduleToken({
            bookingId: b.bookingId,
            originalDate: b.date,
            originalSlug: b.serviceSlug,
            ttlDays: TTL_DAYS,
          });
          const magicLinkUrl = `${SITE_URL}/${locale}/rezervasyon/yeniden-tarih/${token}`;
          const html = rescheduleBatchEmailHtml({
            customerName: b.customerName,
            bookingId: b.bookingId,
            serviceName: b.serviceName,
            originalDate: b.date,
            cancellationReason: parsed.data.cancellationReason,
            magicLinkUrl,
            alternativeDates: b.alternativeDates,
            refundAmount: b.total,
            currency: b.currency,
            ttlDays: TTL_DAYS,
          });
          const text = rescheduleBatchEmailText({
            customerName: b.customerName,
            bookingId: b.bookingId,
            serviceName: b.serviceName,
            originalDate: b.date,
            cancellationReason: parsed.data.cancellationReason,
            magicLinkUrl,
            alternativeDates: b.alternativeDates,
            refundAmount: b.total,
            currency: b.currency,
            ttlDays: TTL_DAYS,
          });
          return {
            to: { email: b.customerEmail, name: b.customerName },
            subject: `[Trip and Tick] Rezervasyonunuz iptal edildi — ${b.bookingId}`,
            htmlContent: html,
            textContent: text,
            tags: ["reschedule", "balon-borsasi"],
          };
        })
    );

    const result = await sendBrevoBatch(emailInputs);
    return NextResponse.json({
      ok: true,
      mode: "send",
      brevoEnabled: brevoEnabled(),
      total: result.total,
      sent: result.sent,
      failed: result.failed,
      demoLogged: result.demoLogged,
      impactedCount: impacted.length,
      skippedNoEmail: impacted.length - emailInputs.length,
    });
  }

  return NextResponse.json({ error: "mode 'preview' veya 'send' olmali" }, { status: 400 });
}
