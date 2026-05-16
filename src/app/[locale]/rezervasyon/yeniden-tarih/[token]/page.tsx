// /[locale]/rezervasyon/yeniden-tarih/[token] — magic-link landing.
// Server: HMAC token verify → booking lookup → alt-tarih oneri → client component.
// Glob check: yeni klasor.
// Q3 Balon borsasi customer-facing UI.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { verifyRescheduleToken } from "@/lib/reschedule-token";
import { getBookingById } from "@/lib/db/bookings";
import { listOverrides } from "@/lib/db/service-overrides";
import { YenidenTarihClient } from "./YenidenTarihClient";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Rezervasyon — Yeni Tarih veya İade | Trip and Tick",
  description: "İptal edilen rezervasyonunuz için alternatif tarih seçin veya tam iade isteyin.",
  robots: { index: false, follow: false },
};

const ALT_LOOKAHEAD_DAYS = 14;
const MAX_ALTERNATIVES = 7;

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

export default async function YenidenTarihPage({
  params,
}: {
  params: { locale: string; token: string };
}) {
  const verify = await verifyRescheduleToken(params.token);
  if (!verify.valid || !verify.payload) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-3">⛔</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Link Geçersiz</h1>
          <p className="text-sm text-slate-600 mb-4">
            {verify.error === "expired"
              ? "Bu link süresi dolmuş. Lütfen müşteri hizmetleri ile iletişime geçin."
              : "Link doğrulanamadı. Lütfen e-postanızdaki orijinal linki kullanın."}
          </p>
          <a
            href="https://wa.me/905374647861"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm"
          >
            WhatsApp ile İletişim
          </a>
        </div>
      </main>
    );
  }

  const booking = await getBookingById(verify.payload.bookingId);
  if (!booking) {
    notFound();
  }

  const alternativeDates = await suggestAlternativeDates(
    verify.payload.originalSlug,
    verify.payload.originalDate
  );

  return (
    <YenidenTarihClient
      token={params.token}
      bookingId={booking.id}
      customerName={booking.passengers[0]?.fullName ?? "Müşteri"}
      serviceName={booking.serviceName}
      originalDate={verify.payload.originalDate}
      alternativeDates={alternativeDates}
      refundAmount={booking.totalPrice}
      currency={booking.currency}
    />
  );
}
