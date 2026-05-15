// B2B acente rezervasyon API endpoint — x-api-key auth.
//
// Importers (client fetch): production'da acente sistemleri + B2B dashboard
//   ApiTab curl example. Auto-route /api/b2b/bookings.
// Affected: acente B2B reservation channel runtime.
// Data:
//   GET → {data: {bookings, agency}, error: null}
//   POST body: {serviceSlug, date (YYYY-MM-DD), pax, customer:{fullName,email,phone}}
//        → {data: {bookingId, status, total, commission, currency}, error: null}
//        bookingId format: TT-B2B-{base36ts}-{base36rand}, createdAt ISO 8601.
// Auth: x-api-key header → getAgencyByApiKey().
// Rate-limit: middleware.ts /api/b2b/* dahil edildi.
// User verbatim: "GET (acente rezervasyonlarini list) + POST (yeni rezervasyon
// olustur). Auth: x-api-key header validate. Response standardi (data + error
// envelope)."

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAgencyByApiKey, agencyNetPrice, type Agency } from "@/data/agencies";
import { MOCK_BOOKINGS } from "@/data/mock-bookings";
import {
  ACTIVITIES,
  TOURS,
  HOTELS,
  PACKAGES,
  TRANSFERS,
} from "@/data/services/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALL_SERVICES = [...ACTIVITIES, ...TOURS, ...HOTELS, ...PACKAGES, ...TRANSFERS];

const bookingSchema = z.object({
  serviceSlug: z.string().min(2).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date YYYY-MM-DD olmali"),
  pax: z.number().int().min(1).max(50),
  customer: z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    phone: z.string().max(40).optional(),
    nationality: z.string().max(40).optional(),
  }),
  notes: z.string().max(500).optional(),
});

function authAgency(req: NextRequest): Agency | null {
  const key = req.headers.get("x-api-key");
  if (!key) return null;
  return getAgencyByApiKey(key) ?? null;
}

function envelope<T>(data: T, error: string | null = null, status = 200) {
  return NextResponse.json({ data, error }, { status });
}

function err(message: string, status: number, details?: unknown) {
  return NextResponse.json({ data: null, error: message, details }, { status });
}

function bookingsForAgency(agency: Agency) {
  const hash = agency.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const start = hash % MOCK_BOOKINGS.length;
  return Array.from({ length: 6 }).map(
    (_, i) => MOCK_BOOKINGS[(start + i) % MOCK_BOOKINGS.length]
  );
}

export async function GET(req: NextRequest) {
  const agency = authAgency(req);
  if (!agency) return err("Yetkisiz — x-api-key gerekli veya gecersiz", 401);
  const bookings = bookingsForAgency(agency).map((b) => ({
    id: b.id,
    serviceSlug: b.serviceSlug,
    serviceName: b.serviceName,
    date: b.date,
    pax: b.pax,
    total: b.total,
    currency: b.currency,
    status: b.status,
    paymentStatus: b.paymentStatus,
    commission: Math.round(b.total * agency.commissionRate),
  }));
  return envelope({
    bookings,
    agency: {
      id: agency.id,
      name: agency.name,
      commissionRate: agency.commissionRate,
      creditLimit: agency.creditLimit,
      creditUsed: agency.creditUsed,
    },
  });
}

export async function POST(req: NextRequest) {
  const agency = authAgency(req);
  if (!agency) return err("Yetkisiz — x-api-key gerekli veya gecersiz", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("Gecersiz JSON", 400);
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return err("Gecersiz veri", 400, parsed.error.flatten());
  }

  const service = ALL_SERVICES.find((s) => s.slug === parsed.data.serviceSlug);
  if (!service) {
    return err(`Hizmet bulunamadi: ${parsed.data.serviceSlug}`, 404);
  }

  const netUnit = agencyNetPrice(service.adultPrice, agency.commissionRate);
  const total = Math.round(netUnit * parsed.data.pax);
  const commission = Math.round(service.adultPrice * parsed.data.pax * agency.commissionRate);

  // Kredi limit kontrol
  if (agency.creditUsed + total > agency.creditLimit) {
    return err(
      `Kredi limiti asildi. Kalan: ${agency.creditLimit - agency.creditUsed} EUR, talep: ${total} EUR`,
      402
    );
  }

  const bookingId = `TT-B2B-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)
    .toString(36)
    .toUpperCase()}`;

  return envelope(
    {
      bookingId,
      status: "confirmed",
      agencyId: agency.id,
      serviceSlug: service.slug,
      serviceName: service.name,
      date: parsed.data.date,
      pax: parsed.data.pax,
      unitListPrice: service.adultPrice,
      unitNetPrice: netUnit,
      total,
      commission,
      currency: service.currency,
      customer: parsed.data.customer,
      createdAt: new Date().toISOString(),
    },
    null,
    201
  );
}
