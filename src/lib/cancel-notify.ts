// Cancel-notify — iptal edilen tarih/slug icin etkilenen rezervasyonlara toplu
// magic-link e-posta gonderimi. /api/admin/reschedule (mode:"send") ve
// /api/admin/service-override (POST, status:"cancelled") ortak cekirdegi.
//
// Importers (callers):
//   - src/app/api/admin/reschedule/route.ts (mode:"send")
//   - src/app/api/admin/service-override/route.ts (POST — status "cancelled" oldugunda auto-trigger)
// Affected: findImpactedBookings + enrichWithAlternatives + magic-link token + Brevo batch.
// Base-fiyat satirlari (BASE_PRICE_DATE) bu fonksiyonu asla tetiklemez — caller sorumlulugu.

import { findImpactedBookings, type ImpactedBooking } from "@/lib/db/bookings";
import { listOverrides } from "@/lib/db/service-overrides";
import { signRescheduleToken } from "@/lib/reschedule-token";
import { sendBrevoBatch, brevoEnabled } from "@/lib/brevo";
import {
  rescheduleBatchEmailHtml,
  rescheduleBatchEmailText,
} from "@/lib/email-templates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tripandtick.com";
const TTL_DAYS = 14;
const ALT_LOOKAHEAD_DAYS = 14;
const MAX_ALTERNATIVES = 5;

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

export interface BookingWithAlternatives extends ImpactedBooking {
  alternativeDates: string[];
}

export async function enrichWithAlternatives(
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

export interface SendCancellationNotificationsOpts {
  slugs: string[];
  date: string;
  cancellationReason?: string;
  locale?: string;
}

export interface CancellationNotifySummary {
  total: number;
  sent: number;
  failed: number;
  demoLogged: number;
  impactedCount: number;
  skippedNoEmail: number;
}

export async function sendCancellationNotifications(
  opts: SendCancellationNotificationsOpts
): Promise<CancellationNotifySummary> {
  const impacted = await findImpactedBookings({ slugs: opts.slugs, date: opts.date });
  if (impacted.length === 0) {
    return { total: 0, sent: 0, failed: 0, demoLogged: 0, impactedCount: 0, skippedNoEmail: 0 };
  }
  const enriched = await enrichWithAlternatives(impacted);
  const locale = opts.locale ?? "tr";

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
          cancellationReason: opts.cancellationReason,
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
          cancellationReason: opts.cancellationReason,
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
  return {
    total: result.total,
    sent: result.sent,
    failed: result.failed,
    demoLogged: result.demoLogged,
    impactedCount: impacted.length,
    skippedNoEmail: impacted.length - emailInputs.length,
  };
}

export { brevoEnabled };
