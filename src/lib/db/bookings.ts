// Booking DB layer — Supabase varsa persist, yoksa mock log fallback.
//
// Importers:
//   - src/app/api/booking/route.ts (POST → persistBooking)
//   - src/app/admin/* (future: listBookingsByCustomer, getBookingById)
// Affected: rezervasyon kalici-kayit. Env yokken mock-bookings.ts fallback.
// Data: bookings tablosu (migration 0001) — id TEXT PK (TT-XXXXXXXX),
//        date YYYY-MM-DD, created_at TIMESTAMPTZ, passengers JSONB.
// User verbatim: "Supabase env varsa DB, yoksa mock-bookings.ts fallback.
//        persistBooking(b) -> string; getBookingById(id); listBookingsByCustomer(email);
//        updateBookingStatus(id, status)"

import {
  MOCK_BOOKINGS,
  getBookingById as getMockBookingById,
  type MockBooking,
} from "@/data/mock-bookings";
import { supabaseAdmin, supabaseEnabled } from "@/lib/supabase";

export interface BookingPassengerInput {
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  age?: number;
  accommodation?: string;
}

export interface BookingDraftInput {
  id?: string;
  customerId?: string | null;
  serviceSlug: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  adults: number;
  children: number;
  passengers: BookingPassengerInput[];
  unitPrice: number;
  totalPrice: number;
  currency: string; // EUR | TRY | USD
  insurance?: boolean;
  promoCode?: string | null;
  discountAmount?: number;
  paymentStatus?: "pending" | "paid" | "refunded" | "failed";
  bookingStatus?: "pending" | "confirmed" | "cancelled" | "completed";
  stripeSessionId?: string | null;
  stripePaymentIntent?: string | null;
  specialRequests?: string | null;
}

export interface DBBooking {
  id: string;
  customerId: string | null;
  serviceSlug: string;
  serviceName: string;
  date: string;
  adults: number;
  children: number;
  passengers: BookingPassengerInput[];
  unitPrice: number;
  totalPrice: number;
  currency: string;
  insurance: boolean;
  promoCode: string | null;
  discountAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  stripeSessionId: string | null;
  stripePaymentIntent: string | null;
  specialRequests: string | null;
  createdAt: string;
  updatedAt: string;
}

function generateBookingId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "TT-";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function mockToDB(m: MockBooking): DBBooking {
  return {
    id: m.id,
    customerId: m.customerId,
    serviceSlug: m.serviceSlug,
    serviceName: m.serviceName,
    date: m.date,
    adults: m.adults,
    children: m.children,
    passengers: m.passengers.map((p) => ({
      fullName: p.fullName,
      email: m.customerEmail,
      phone: m.customerPhone,
      nationality: p.nationality,
      age: p.age,
    })),
    unitPrice: m.unitPrice,
    totalPrice: m.total,
    currency: m.currency,
    insurance: m.insurance,
    promoCode: m.couponCode ?? null,
    discountAmount: m.discount,
    paymentStatus: m.paymentStatus === "unpaid" ? "pending" : m.paymentStatus,
    bookingStatus: m.status,
    stripeSessionId: null,
    stripePaymentIntent: null,
    specialRequests: m.notes ?? null,
    createdAt: m.createdAt,
    updatedAt: m.createdAt,
  };
}

/**
 * Yeni rezervasyon kaydet. Supabase varsa DB, yoksa mock log.
 * Returns: booking id (TT-XXXXXXXX).
 */
export async function persistBooking(b: BookingDraftInput): Promise<string> {
  const bookingId = b.id ?? generateBookingId();
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    console.info(
      "[db/bookings] mock persist (Supabase env yok)",
      JSON.stringify({ id: bookingId, slug: b.serviceSlug, date: b.date, total: b.totalPrice })
    );
    return bookingId;
  }

  const row = {
    id: bookingId,
    customer_id: b.customerId ?? null,
    service_slug: b.serviceSlug,
    service_name: b.serviceName,
    date: b.date,
    adults: b.adults,
    children: b.children,
    passengers: b.passengers,
    unit_price: b.unitPrice,
    total_price: b.totalPrice,
    currency: b.currency,
    insurance: b.insurance ?? false,
    promo_code: b.promoCode ?? null,
    discount_amount: b.discountAmount ?? 0,
    payment_status: b.paymentStatus ?? "pending",
    booking_status: b.bookingStatus ?? "pending",
    stripe_session_id: b.stripeSessionId ?? null,
    stripe_payment_intent: b.stripePaymentIntent ?? null,
    special_requests: b.specialRequests ?? null,
  };

  const { error } = await client.from("bookings").insert(row);
  if (error) {
    console.error("[db/bookings] insert failed", error.message, error.details);
    // Hatasi olsa bile booking id don — caller mock fallback ile devam.
    return bookingId;
  }
  return bookingId;
}

export async function getBookingById(id: string): Promise<DBBooking | null> {
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    const m = getMockBookingById(id);
    return m ? mockToDB(m) : null;
  }
  const { data, error } = await client
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[db/bookings] getBookingById failed", error.message);
    return null;
  }
  if (!data) return null;
  return rowToDBBooking(data as BookingRow);
}

export async function listBookingsByCustomer(email: string): Promise<DBBooking[]> {
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    return MOCK_BOOKINGS.filter(
      (b) => b.customerEmail.toLowerCase() === email.toLowerCase()
    ).map(mockToDB);
  }
  const { data: customer } = await client
    .from("customers")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (!customer?.id) return [];
  const { data, error } = await client
    .from("bookings")
    .select("*")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[db/bookings] listByCustomer failed", error.message);
    return [];
  }
  return ((data ?? []) as BookingRow[]).map(rowToDBBooking);
}

export interface ImpactedBooking {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceSlug: string;
  serviceName: string;
  date: string;
  pax: number;
  total: number;
  currency: string;
  bookingStatus: string;
  paymentStatus: string;
}

/**
 * Q3 Balon borsasi: belirli slugs + date kombosu icin etkilenen aktif rezervasyon listesi.
 * Filter: booking_status in {confirmed, pending}, payment_status != refunded.
 * Supabase varsa bookings tablosu; yoksa MOCK_BOOKINGS filter.
 */
export async function findImpactedBookings(opts: {
  slugs: string[];
  date: string;
}): Promise<ImpactedBooking[]> {
  if (opts.slugs.length === 0) return [];
  const client = supabaseAdmin();

  if (!supabaseEnabled || !client) {
    const slugSet = new Set(opts.slugs);
    return MOCK_BOOKINGS.filter(
      (b) =>
        slugSet.has(b.serviceSlug) &&
        b.date === opts.date &&
        (b.status === "confirmed" || b.status === "pending") &&
        b.paymentStatus !== "refunded"
    ).map((b) => ({
      bookingId: b.id,
      customerName: b.customerName,
      customerEmail: b.customerEmail,
      customerPhone: b.customerPhone,
      serviceSlug: b.serviceSlug,
      serviceName: b.serviceName,
      date: b.date,
      pax: b.pax,
      total: b.total,
      currency: b.currency,
      bookingStatus: b.status,
      paymentStatus: b.paymentStatus,
    }));
  }

  const { data, error } = await client
    .from("bookings")
    .select("id, service_slug, service_name, date, adults, children, total_price, currency, booking_status, payment_status, passengers, customer_id")
    .in("service_slug", opts.slugs)
    .eq("date", opts.date)
    .in("booking_status", ["confirmed", "pending"])
    .neq("payment_status", "refunded");
  if (error) {
    console.error("[db/bookings] findImpactedBookings failed", error.message);
    return [];
  }

  type Row = {
    id: string;
    service_slug: string;
    service_name: string;
    date: string;
    adults: number;
    children: number;
    total_price: number | string;
    currency: string;
    booking_status: string;
    payment_status: string;
    passengers: BookingPassengerInput[] | null;
    customer_id: string | null;
  };

  const rows = (data ?? []) as Row[];
  const customerIds = Array.from(
    new Set(rows.map((r) => r.customer_id).filter((x): x is string => Boolean(x)))
  );
  let customerMap = new Map<string, { full_name: string; email: string; phone: string }>();
  if (customerIds.length > 0) {
    const { data: customers } = await client
      .from("customers")
      .select("id, full_name, email, phone")
      .in("id", customerIds);
    customerMap = new Map(
      ((customers ?? []) as Array<{ id: string; full_name: string; email: string; phone: string }>).map(
        (c) => [c.id, { full_name: c.full_name, email: c.email, phone: c.phone }]
      )
    );
  }

  return rows.map((r) => {
    const cust = r.customer_id ? customerMap.get(r.customer_id) : undefined;
    const leadPassenger = Array.isArray(r.passengers) && r.passengers.length > 0 ? r.passengers[0] : undefined;
    return {
      bookingId: r.id,
      customerName: cust?.full_name ?? leadPassenger?.fullName ?? "Müşteri",
      customerEmail: cust?.email ?? leadPassenger?.email ?? "",
      customerPhone: cust?.phone ?? leadPassenger?.phone ?? "",
      serviceSlug: r.service_slug,
      serviceName: r.service_name,
      date: r.date,
      pax: r.adults + r.children,
      total: Number(r.total_price),
      currency: r.currency,
      bookingStatus: r.booking_status,
      paymentStatus: r.payment_status,
    };
  });
}

export async function updateBookingStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled" | "completed",
  paymentStatus?: "pending" | "paid" | "refunded" | "failed"
): Promise<void> {
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    console.info("[db/bookings] mock updateStatus", JSON.stringify({ id, status, paymentStatus }));
    return;
  }
  const patch: Record<string, unknown> = { booking_status: status };
  if (paymentStatus) patch.payment_status = paymentStatus;
  const { error } = await client.from("bookings").update(patch).eq("id", id);
  if (error) {
    console.error("[db/bookings] updateStatus failed", error.message);
  }
}

interface BookingRow {
  id: string;
  customer_id: string | null;
  service_slug: string;
  service_name: string;
  date: string;
  adults: number;
  children: number;
  passengers: BookingPassengerInput[] | null;
  unit_price: number | string;
  total_price: number | string;
  currency: string;
  insurance: boolean;
  promo_code: string | null;
  discount_amount: number | string;
  payment_status: string;
  booking_status: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

function rowToDBBooking(r: BookingRow): DBBooking {
  return {
    id: r.id,
    customerId: r.customer_id,
    serviceSlug: r.service_slug,
    serviceName: r.service_name,
    date: r.date,
    adults: r.adults,
    children: r.children,
    passengers: Array.isArray(r.passengers) ? r.passengers : [],
    unitPrice: Number(r.unit_price),
    totalPrice: Number(r.total_price),
    currency: r.currency,
    insurance: r.insurance,
    promoCode: r.promo_code,
    discountAmount: Number(r.discount_amount),
    paymentStatus: r.payment_status,
    bookingStatus: r.booking_status,
    stripeSessionId: r.stripe_session_id,
    stripePaymentIntent: r.stripe_payment_intent,
    specialRequests: r.special_requests,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
