// /api/admin/refund — admin manuel iade tetikleme (Stripe Refunds API).
//
// Callers:
//   - src/app/admin/fiyat/page.tsx (admin UI — buton ileride eklenir)
//   - Manuel curl/Postman (x-admin-token + bookingId)
// Auth: x-admin-token header ADMIN_API_TOKEN eslesme.
// Body: { bookingId, reason?, amountMinor?, notifyCustomer? }.

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getBookingById, updateBookingStatus } from "@/lib/db/bookings";
import { createStripeRefund } from "@/lib/stripe-refund";
import { sendBrevoEmail, brevoAdminAddress } from "@/lib/brevo";
import {
  rescheduleConfirmationEmailHtml,
  rescheduleConfirmationEmailText,
} from "@/lib/email-templates";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN ?? "demo-admin-token-rotate-me";

function authorized(req: NextRequest): boolean {
  const tok = req.headers.get("x-admin-token");
  if (!tok) return false;
  return tok === ADMIN_TOKEN;
}

const bodySchema = z.object({
  bookingId: z.string().regex(/^TT-[A-Z0-9]{8}$/),
  reason: z.enum(["duplicate", "fraudulent", "requested_by_customer"]).optional(),
  amountMinor: z.number().int().positive().optional(),
  notifyCustomer: z.boolean().default(true),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
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
  const { bookingId, reason, amountMinor, notifyCustomer, note } = parsed.data;

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Rezervasyon bulunamadi" }, { status: 404 });
  }
  if (booking.paymentStatus === "refunded") {
    return NextResponse.json({ error: "Bu rezervasyon zaten iade edilmis" }, { status: 409 });
  }
  if (!booking.stripeSessionId && !booking.stripePaymentIntent) {
    return NextResponse.json(
      { error: "Stripe odeme referansi yok — manuel kayit, panel'den isle" },
      { status: 422 }
    );
  }

  const refundResult = await createStripeRefund({
    paymentIntent: booking.stripePaymentIntent,
    sessionId: booking.stripeSessionId,
    amountMinor,
    reason: reason ?? "requested_by_customer",
    metadata: { bookingId: booking.id, source: "admin-manual" },
  });

  if (!refundResult.ok && !refundResult.demoLogged) {
    return NextResponse.json(
      { error: refundResult.error ?? "Stripe refund basarisiz" },
      { status: 502 }
    );
  }

  await updateBookingStatus(booking.id, "cancelled", "refunded");

  const leadName = booking.passengers[0]?.fullName ?? "Müşteri";
  const customerEmail = booking.passengers[0]?.email ?? "";
  const refundAmountTotal = typeof amountMinor === "number"
    ? amountMinor / 100
    : booking.totalPrice;

  if (notifyCustomer && customerEmail) {
    await sendBrevoEmail({
      to: { email: customerEmail, name: leadName },
      subject: `İade tamamlandi — ${booking.id}`,
      htmlContent: rescheduleConfirmationEmailHtml({
        customerName: leadName,
        bookingId: booking.id,
        serviceName: booking.serviceName,
        choice: "refund",
        refundAmount: refundAmountTotal,
        currency: booking.currency,
      }),
      textContent: rescheduleConfirmationEmailText({
        customerName: leadName,
        bookingId: booking.id,
        serviceName: booking.serviceName,
        choice: "refund",
        refundAmount: refundAmountTotal,
        currency: booking.currency,
      }),
      tags: ["admin-manual-refund"],
    });
  }

  await sendBrevoEmail({
    to: brevoAdminAddress(),
    subject: `[ADMIN] Manuel iade isle — ${booking.id}`,
    htmlContent: `<h3>Manuel admin iade</h3>
<ul>
<li><b>Booking:</b> ${booking.id}</li>
<li><b>Musteri:</b> ${leadName} (${customerEmail})</li>
<li><b>Tutar:</b> ${refundAmountTotal} ${booking.currency}</li>
<li><b>Stripe Refund:</b> ${refundResult.ok ? refundResult.refundId : "demo-log"} (${refundResult.status ?? "—"})</li>
${note ? `<li><b>Not:</b> ${note}</li>` : ""}
</ul>`,
    tags: ["admin-refund-log"],
  });

  return NextResponse.json({
    ok: true,
    bookingId: booking.id,
    refund: refundResult.ok
      ? {
          id: refundResult.refundId,
          status: refundResult.status,
          amountMinor: refundResult.amountMinor,
          currency: refundResult.currency,
        }
      : { demoLogged: true },
  });
}
