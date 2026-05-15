import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
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
});

function generateBookingId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "TT-";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
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

    // Faz 2: Brevo e-posta tetigi
    // await sendBookingConfirmation({ to: leadPax.email, bookingId, ... })

    return NextResponse.json({
      bookingId,
      status: "pending",
      createdAt,
      message: "Rezervasyonunuz alındı. Onay e-postası birazdan iletilecek.",
    });
  } catch (err) {
    console.error("[api/booking] persist error", err);
    return NextResponse.json(
      { error: "Rezervasyon kaydedilemedi. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
