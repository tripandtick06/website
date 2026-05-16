import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  customerBookingEmailHtml,
  customerBookingEmailText,
  adminBookingEmailHtml,
  adminBookingEmailText,
  type BookingEmailPayload,
} from "@/lib/email-templates";
import { persistBooking } from "@/lib/db/bookings";
import { upsertCustomer } from "@/lib/db/customers";
import { supabaseEnabled } from "@/lib/supabase";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const passengerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  nationality: z.string().min(2),
  age: z.number().int().min(0).max(120).optional(),
  accommodation: z.string().optional(),
});

const bookingSchema = z.object({
  serviceSlug: z.string().min(1),
  serviceName: z.string().min(1),
  date: z.string().min(8),
  adults: z.number().int().min(1).max(50),
  children: z.number().int().min(0).max(20),
  totalPrice: z.number().positive(),
  currency: z.enum(["EUR", "TRY", "USD"]),
  passengers: z.array(passengerSchema).min(1),
  insurance: z.boolean().optional().default(false),
  promoCode: z.string().optional(),
  paymentSessionId: z.string().optional(),
  specialRequests: z.string().max(2000).optional(),
});

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL ?? "noreply@tripandtick.com";
const BREVO_FROM_NAME = process.env.BREVO_FROM_NAME ?? "Trip and Tick";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "info@tripandtick.com";

function generateBookingId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "TT-";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

interface BrevoSendInput {
  to: { email: string; name: string };
  subject: string;
  htmlContent: string;
  textContent: string;
  replyTo?: { email: string; name?: string };
  tag: "customer" | "admin";
}

async function sendBrevoEmail(input: BrevoSendInput): Promise<{ ok: boolean; status?: number; error?: string }> {
  if (!BREVO_API_KEY) {
    console.info(
      `[api/booking] BREVO_API_KEY yok — ${input.tag} mail loglandi`,
      JSON.stringify({ to: input.to.email, subject: input.subject })
    );
    return { ok: false, error: "BREVO_API_KEY missing" };
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
        ...(input.replyTo ? { replyTo: input.replyTo } : {}),
        subject: input.subject,
        htmlContent: input.htmlContent,
        textContent: input.textContent,
        tags: ["booking", input.tag],
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[api/booking] Brevo ${input.tag} gonderim hatasi`, res.status, errText);
      return { ok: false, status: res.status, error: errText };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    console.error(`[api/booking] Brevo ${input.tag} fetch error`, err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz rezervasyon verisi", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const bookingId = generateBookingId();
    const createdAt = new Date().toISOString();

    // Faz 1: log dosyasi (Faz 2: Supabase insert)
    const record = {
      id: bookingId,
      ...parsed.data,
      status: "pending",
      createdAt,
    };

    console.info("[api/booking] Yeni rezervasyon", JSON.stringify(record, null, 2));

    // Faz 2: Supabase persist (env yoksa mock-log fallback)
    const leadPaxForDb = parsed.data.passengers[0];
    const paxCount = parsed.data.adults + parsed.data.children;
    const unitPrice =
      paxCount > 0 ? Math.round((parsed.data.totalPrice / paxCount) * 100) / 100 : parsed.data.totalPrice;

    let customerId: string | null = null;
    try {
      const customer = await upsertCustomer(leadPaxForDb.email, {
        fullName: leadPaxForDb.fullName,
        phone: leadPaxForDb.phone,
        nationality: leadPaxForDb.nationality,
      });
      customerId = customer?.id ?? null;
    } catch (err) {
      console.warn("[api/booking] upsertCustomer error (devam)", err);
    }

    try {
      await persistBooking({
        id: bookingId,
        customerId,
        serviceSlug: parsed.data.serviceSlug,
        serviceName: parsed.data.serviceName,
        date: parsed.data.date,
        adults: parsed.data.adults,
        children: parsed.data.children,
        passengers: parsed.data.passengers,
        unitPrice,
        totalPrice: parsed.data.totalPrice,
        currency: parsed.data.currency,
        insurance: parsed.data.insurance ?? false,
        promoCode: parsed.data.promoCode ?? null,
        paymentStatus: "pending",
        bookingStatus: "pending",
        stripeSessionId: parsed.data.paymentSessionId ?? null,
        specialRequests: parsed.data.specialRequests ?? null,
      });
    } catch (err) {
      console.warn("[api/booking] persistBooking error (devam — mock fallback)", err);
    }

    if (!supabaseEnabled) {
      console.info("[api/booking] Supabase env yok — mock log mode aktif");
    }

    // Faz 2: Brevo e-posta tetigi (musteri + admin paralel)
    const leadPax = parsed.data.passengers[0];
    const emailPayload: BookingEmailPayload = {
      bookingId,
      customerName: leadPax.fullName,
      customerEmail: leadPax.email,
      customerPhone: leadPax.phone,
      serviceName: parsed.data.serviceName,
      serviceSlug: parsed.data.serviceSlug,
      date: parsed.data.date,
      adults: parsed.data.adults,
      children: parsed.data.children,
      totalPrice: parsed.data.totalPrice,
      currency: parsed.data.currency,
      passengers: parsed.data.passengers.map((p) => ({
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,
        nationality: p.nationality,
      })),
      insurance: parsed.data.insurance ?? false,
      specialRequests: parsed.data.specialRequests,
      createdAt,
    };

    const customerSend = sendBrevoEmail({
      to: { email: leadPax.email, name: leadPax.fullName },
      subject: `Rezervasyonunuz Onaylandı — ${bookingId}`,
      htmlContent: customerBookingEmailHtml(emailPayload),
      textContent: customerBookingEmailText(emailPayload),
      replyTo: { email: ADMIN_EMAIL, name: "Trip and Tick" },
      tag: "customer",
    });

    const adminSend = sendBrevoEmail({
      to: { email: ADMIN_EMAIL, name: "Trip and Tick" },
      subject: `YENI REZERVASYON: ${bookingId} — ${parsed.data.serviceName}`,
      htmlContent: adminBookingEmailHtml(emailPayload),
      textContent: adminBookingEmailText(emailPayload),
      replyTo: { email: leadPax.email, name: leadPax.fullName },
      tag: "admin",
    });

    // Paralel — hata olsa bile booking 200 doner
    const [customerResult, adminResult] = await Promise.allSettled([customerSend, adminSend]);

    const emailStatus = {
      customer: customerResult.status === "fulfilled" ? customerResult.value.ok : false,
      admin: adminResult.status === "fulfilled" ? adminResult.value.ok : false,
    };

    if (!emailStatus.customer || !emailStatus.admin) {
      console.warn("[api/booking] Mail gonderim kismi/tam hata", JSON.stringify(emailStatus));
    }

    return NextResponse.json({
      bookingId,
      status: "pending",
      createdAt,
      emailSent: emailStatus,
      message: emailStatus.customer
        ? "Rezervasyonunuz alındı. Onay e-postası iletildi."
        : "Rezervasyonunuz alındı. E-posta gönderiminde gecikme olabilir — kodunuzu not edin.",
    });
  } catch (err) {
    console.error("[api/booking] persist error", err);
    return NextResponse.json(
      { error: "Rezervasyon kaydedilemedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
