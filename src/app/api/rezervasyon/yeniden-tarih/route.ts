// /api/rezervasyon/yeniden-tarih — customer magic-link confirm endpoint.
//
// Importers (callers):
//   - src/app/[locale]/rezervasyon/yeniden-tarih/[token]/YenidenTarihClient.tsx
// Verify HMAC token + iki aksiyon: reschedule (yeni tarih) veya refund (iade).
// Booking durum guncelle + Brevo confirmation gonder + admin'i bilgilendir.
//
// Note: MOCK_BOOKINGS in-memory — restart sonra durum sifirlanir. Supabase aktifken
// updateBookingStatus DB'ye yazar. Reschedule icin bookings.date alanini elle update
// Q4 sprint'inde (migration pending).

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { verifyRescheduleToken } from "@/lib/reschedule-token";
import {
  getBookingById,
  updateBookingStatus,
  updateBookingDate,
} from "@/lib/db/bookings";
import { sendBrevoEmail, brevoAdminAddress } from "@/lib/brevo";
import {
  rescheduleConfirmationEmailHtml,
  rescheduleConfirmationEmailText,
} from "@/lib/email-templates";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  token: z.string().min(20),
  action: z.enum(["reschedule", "refund"]),
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON parse hatasi" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Gecersiz veri", details: parsed.error.flatten() }, { status: 400 });
  }
  const { token, action, newDate } = parsed.data;

  const verify = await verifyRescheduleToken(token);
  if (!verify.valid || !verify.payload) {
    return NextResponse.json(
      { error: verify.error === "expired" ? "Link suresi dolmus" : "Gecersiz link" },
      { status: 410 }
    );
  }
  const payload = verify.payload;

  const booking = await getBookingById(payload.bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Rezervasyon bulunamadi" }, { status: 404 });
  }

  const leadName = booking.passengers[0]?.fullName ?? "Müşteri";
  const customerEmail = booking.passengers[0]?.email ?? "";

  if (action === "reschedule") {
    if (!newDate) {
      return NextResponse.json({ error: "Yeni tarih zorunlu" }, { status: 400 });
    }
    if (newDate <= payload.originalDate) {
      return NextResponse.json({ error: "Yeni tarih orijinal tarihten sonra olmali" }, { status: 400 });
    }
    await updateBookingStatus(
      booking.id,
      "confirmed",
      booking.paymentStatus as "paid" | "pending" | "refunded" | "failed"
    );
    await updateBookingDate(booking.id, newDate);
    console.info("[api/rezervasyon/yeniden-tarih] reschedule", {
      bookingId: booking.id,
      from: payload.originalDate,
      to: newDate,
    });

    if (customerEmail) {
      await sendBrevoEmail({
        to: { email: customerEmail, name: leadName },
        subject: `Yeni tarih onaylandi — ${booking.id}`,
        htmlContent: rescheduleConfirmationEmailHtml({
          customerName: leadName,
          bookingId: booking.id,
          serviceName: booking.serviceName,
          choice: "reschedule",
          newDate,
        }),
        textContent: rescheduleConfirmationEmailText({
          customerName: leadName,
          bookingId: booking.id,
          serviceName: booking.serviceName,
          choice: "reschedule",
          newDate,
        }),
        tags: ["reschedule-confirm"],
      });
    }
    await sendBrevoEmail({
      to: brevoAdminAddress(),
      subject: `[ADMIN] Reschedule onayi — ${booking.id} (${payload.originalDate} → ${newDate})`,
      htmlContent: `<h3>Reschedule onaylandi</h3>
<ul>
<li><b>Booking:</b> ${booking.id}</li>
<li><b>Musteri:</b> ${leadName} (${customerEmail})</li>
<li><b>Hizmet:</b> ${booking.serviceName}</li>
<li><b>Eski tarih:</b> ${payload.originalDate}</li>
<li><b>Yeni tarih:</b> ${newDate}</li>
<li><b>Tutar:</b> ${booking.totalPrice} ${booking.currency}</li>
</ul>
<p><b>Aksiyon:</b> bookings.date DB-tarafi otomatik guncellendi.</p>`,
      tags: ["admin-reschedule"],
    });

    return NextResponse.json({
      ok: true,
      choice: "reschedule",
      bookingId: booking.id,
      newDate,
    });
  }

  // action === "refund"
  await updateBookingStatus(booking.id, "cancelled", "refunded");
  console.info("[api/rezervasyon/yeniden-tarih] refund", {
    bookingId: booking.id,
    date: payload.originalDate,
    amount: booking.totalPrice,
  });

  if (customerEmail) {
    await sendBrevoEmail({
      to: { email: customerEmail, name: leadName },
      subject: `İade talebiniz alindi — ${booking.id}`,
      htmlContent: rescheduleConfirmationEmailHtml({
        customerName: leadName,
        bookingId: booking.id,
        serviceName: booking.serviceName,
        choice: "refund",
        refundAmount: booking.totalPrice,
        currency: booking.currency,
      }),
      textContent: rescheduleConfirmationEmailText({
        customerName: leadName,
        bookingId: booking.id,
        serviceName: booking.serviceName,
        choice: "refund",
        refundAmount: booking.totalPrice,
        currency: booking.currency,
      }),
      tags: ["refund-confirm"],
    });
  }
  await sendBrevoEmail({
    to: brevoAdminAddress(),
    subject: `[ADMIN] İade talebi — ${booking.id} (${booking.totalPrice} ${booking.currency})`,
    htmlContent: `<h3>Iade talebi geldi</h3>
<ul>
<li><b>Booking:</b> ${booking.id}</li>
<li><b>Musteri:</b> ${leadName} (${customerEmail})</li>
<li><b>Hizmet:</b> ${booking.serviceName} — ${payload.originalDate}</li>
<li><b>Iade tutari:</b> ${booking.totalPrice} ${booking.currency}</li>
<li><b>Odeme:</b> ${booking.stripeSessionId ? `Stripe ${booking.stripeSessionId}` : "—"}</li>
</ul>
<p><b>Aksiyon:</b> Stripe/iyzico panelinden iade isle (5 is gunu icinde).</p>`,
    tags: ["admin-refund"],
  });

  return NextResponse.json({
    ok: true,
    choice: "refund",
    bookingId: booking.id,
    refundAmount: booking.totalPrice,
    currency: booking.currency,
  });
}
