// Mock rezervasyon kataloğu — admin paneli Dashboard/Rezervasyonlar/Detay sayfaları.
//
// Importers:
//   - src/app/admin/page.tsx (Dashboard, Rezervasyonlar tabs)
//   - src/app/admin/rezervasyon/[id]/page.tsx (detay sayfası)
// Affected: admin booking overview, mock booking detail page.
// Data: 50 rezervasyon — deterministic xorshift32 seeded per index. Refresh sonra ayni.
//        date: YYYY-MM-DD (son 90 / gelecek 90 gun). createdAt/paidAt: ISO 8601 full.
//        customerId → MOCK_CUSTOMERS FK.
// User verbatim: "50 entry: cesitli hizmet slug, tarih (son 90 gun ve gelecek 90 gun),
// kisi, durum (bekliyor/onaylandi/iptal/tamamlandi), tutar, musteri ID. Deterministik
// — refresh sonra ayni. Helper: getBookingById, getBookingsByCustomer,
// getBookingsByStatus, getBookingStats()."

import { MOCK_CUSTOMERS } from "@/data/mock-customers";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "partial_refund";

export interface MockBookingPassenger {
  fullName: string;
  age?: number;
  nationality: string;
}

export interface MockBookingEmailLog {
  type: "confirmation" | "reminder" | "cancellation" | "refund";
  sentAt: string;
  to: string;
  status: "sent" | "failed";
}

export interface MockBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceSlug: string;
  serviceName: string;
  serviceCategory: "balloon" | "activity" | "tour" | "hotel" | "package" | "transfer";
  date: string;
  pax: number;
  adults: number;
  children: number;
  passengers: MockBookingPassenger[];
  unitPrice: number;
  subtotal: number;
  discount: number;
  couponCode?: string;
  insurance: boolean;
  insuranceTotal: number;
  total: number;
  currency: "EUR" | "TRY" | "USD";
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  operatorId?: string;
  operatorName?: string;
  createdAt: string;
  paidAt?: string;
  emailLog: MockBookingEmailLog[];
  notes?: string;
}

function rand(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 1000000) / 1000000;
  };
}

const SERVICES = [
  { slug: "standart-balon-ucusu", name: "Standart Balon Uçuşu", category: "balloon" as const, price: 165 },
  { slug: "konfor-balon-ucusu", name: "Konfor Balon Uçuşu", category: "balloon" as const, price: 215 },
  { slug: "deluxe-balon-ucusu", name: "Deluxe Balon Uçuşu", category: "balloon" as const, price: 295 },
  { slug: "romantik-ozel-balon", name: "Romantik Özel Balon", category: "balloon" as const, price: 580 },
  { slug: "atv-standart", name: "ATV Standart Tur", category: "activity" as const, price: 29 },
  { slug: "atv-full", name: "ATV Full Experience", category: "activity" as const, price: 55 },
  { slug: "jeep-tam", name: "Jeep Safari Tam Gün", category: "activity" as const, price: 85 },
  { slug: "at-sunrise", name: "Sunrise At Binme", category: "activity" as const, price: 35 },
  { slug: "kirmizi-tur", name: "Kapadokya Kırmızı Tur", category: "tour" as const, price: 35 },
  { slug: "yesil-tur", name: "Kapadokya Yeşil Tur", category: "tour" as const, price: 40 },
  { slug: "gun-batimi-turu", name: "Gün Batımı Turu", category: "tour" as const, price: 25 },
  { slug: "magara-otel-deluxe", name: "Mağara Otel Deluxe", category: "hotel" as const, price: 120 },
  { slug: "magara-otel-suit", name: "Mağara Otel Süit", category: "hotel" as const, price: 195 },
  { slug: "tam-gun-paket", name: "Kapadokya Tam Gün", category: "package" as const, price: 199 },
  { slug: "balayi-paketi", name: "Balayı Paketi", category: "package" as const, price: 920 },
  { slug: "macera-paketi", name: "Macera Paketi", category: "package" as const, price: 229 },
  { slug: "aile-paketi", name: "Aile Paketi", category: "package" as const, price: 545 },
  { slug: "nev-otel", name: "Nevşehir → Otel Transfer", category: "transfer" as const, price: 35 },
  { slug: "kayseri-otel", name: "Kayseri → Otel Transfer", category: "transfer" as const, price: 55 },
];

const STATUSES: BookingStatus[] = ["confirmed", "confirmed", "confirmed", "pending", "completed", "cancelled"];
const PAYMENT_METHODS = ["Stripe Card", "Stripe Card", "Stripe Card", "Bank Transfer", "Cash on Arrival"];
const OPERATORS = [
  { id: "kaya", name: "Kaya Balloons" },
  { id: "istanbul", name: "Istanbul Balloons" },
  { id: "butterfly", name: "Butterfly Balloons" },
  { id: "royal", name: "Royal Balloon" },
  { id: "voyager", name: "Voyager Balloons" },
];
const COUPONS = [undefined, undefined, undefined, "WELCOME10", "EMERCE5", "MACERA20", "AILE15"];
const INSURANCE_PER_PAX = 9;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function isoDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function buildBookings(): MockBooking[] {
  const bookings: MockBooking[] = [];
  const today = new Date("2026-05-15T00:00:00.000Z").getTime();
  const DAY = 86400000;

  for (let i = 0; i < 50; i++) {
    const rng = rand(i * 17 + 23);
    const service = SERVICES[Math.floor(rng() * SERVICES.length)];
    const status = STATUSES[Math.floor(rng() * STATUSES.length)];
    const customer = MOCK_CUSTOMERS[Math.floor(rng() * MOCK_CUSTOMERS.length)];

    const dayOffset = Math.floor(rng() * 180) - 90;
    const dateObj = new Date(today + dayOffset * DAY);
    const date = isoDate(dateObj);

    const adults = 1 + Math.floor(rng() * 4);
    const children =
      service.category === "balloon" || service.category === "activity"
        ? rng() > 0.7
          ? Math.floor(rng() * 2)
          : 0
        : Math.floor(rng() * 3);
    const pax = adults + children;

    const insurance = rng() > 0.65;
    const insuranceTotal = insurance ? pax * INSURANCE_PER_PAX : 0;
    const subtotal = adults * service.price + children * service.price * 0.8;

    const couponCode = COUPONS[Math.floor(rng() * COUPONS.length)];
    let discount = 0;
    if (couponCode === "WELCOME10") discount = Math.round(subtotal * 0.1);
    else if (couponCode === "EMERCE5") discount = Math.round(subtotal * 0.05);
    else if (couponCode === "MACERA20") discount = Math.round(subtotal * 0.2);
    else if (couponCode === "AILE15") discount = Math.round(subtotal * 0.15);

    const total = Math.max(0, Math.round(subtotal - discount + insuranceTotal));

    const isBalloon = service.category === "balloon";
    const operator = isBalloon ? OPERATORS[Math.floor(rng() * OPERATORS.length)] : undefined;

    const createdAt = new Date(today + dayOffset * DAY - Math.floor(rng() * 60) * DAY).toISOString();
    const paidAt =
      status === "confirmed" || status === "completed"
        ? new Date(new Date(createdAt).getTime() + Math.floor(rng() * 3600 * 24) * 1000).toISOString()
        : undefined;

    const paymentStatus: PaymentStatus =
      status === "cancelled"
        ? rng() > 0.5
          ? "refunded"
          : "unpaid"
        : status === "pending"
        ? "unpaid"
        : "paid";

    const passengers: MockBookingPassenger[] = Array.from({ length: pax }).map((_, k) => ({
      fullName:
        k === 0 ? customer.fullName : `${customer.fullName.split(" ")[0]} Yolcu ${k + 1}`,
      age: k === 0 ? 30 + Math.floor(rng() * 30) : 8 + Math.floor(rng() * 50),
      nationality: customer.nationality,
    }));

    const emailLog: MockBookingEmailLog[] = [];
    if (status !== "cancelled" || paymentStatus === "refunded") {
      emailLog.push({
        type: "confirmation",
        sentAt: createdAt,
        to: customer.email,
        status: "sent",
      });
    }
    if (status === "confirmed" && dayOffset > 0) {
      emailLog.push({
        type: "reminder",
        sentAt: new Date(dateObj.getTime() - DAY).toISOString(),
        to: customer.email,
        status: "sent",
      });
    }
    if (status === "cancelled") {
      emailLog.push({
        type: "cancellation",
        sentAt: new Date(new Date(createdAt).getTime() + DAY).toISOString(),
        to: customer.email,
        status: "sent",
      });
      if (paymentStatus === "refunded") {
        emailLog.push({
          type: "refund",
          sentAt: new Date(new Date(createdAt).getTime() + 2 * DAY).toISOString(),
          to: customer.email,
          status: "sent",
        });
      }
    }

    bookings.push({
      id: `TT-${String(2000 + i).padStart(4, "0")}`,
      customerId: customer.id,
      customerName: customer.fullName,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      serviceSlug: service.slug,
      serviceName: service.name,
      serviceCategory: service.category,
      date,
      pax,
      adults,
      children,
      passengers,
      unitPrice: service.price,
      subtotal: Math.round(subtotal),
      discount,
      couponCode,
      insurance,
      insuranceTotal,
      total,
      currency: "EUR",
      status,
      paymentStatus,
      paymentMethod: PAYMENT_METHODS[Math.floor(rng() * PAYMENT_METHODS.length)],
      operatorId: operator?.id,
      operatorName: operator?.name,
      createdAt,
      paidAt,
      emailLog,
      notes: rng() > 0.85 ? "Müşteri özel istek: vejetaryen kahvaltı" : undefined,
    });
  }

  return bookings;
}

export const MOCK_BOOKINGS: MockBooking[] = buildBookings();

export function getBookingById(id: string): MockBooking | undefined {
  return MOCK_BOOKINGS.find((b) => b.id === id);
}

export function getBookingsByCustomer(customerId: string): MockBooking[] {
  return MOCK_BOOKINGS.filter((b) => b.customerId === customerId);
}

export function getBookingsByStatus(status: BookingStatus): MockBooking[] {
  return MOCK_BOOKINGS.filter((b) => b.status === status);
}

export function getBookingStats(): {
  total: number;
  byStatus: Record<BookingStatus, number>;
  totalRevenue: number;
  paidRevenue: number;
  averageTicket: number;
  todayCount: number;
  todayRevenue: number;
  monthRevenue: number;
} {
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = today.slice(0, 7);
  const byStatus: Record<BookingStatus, number> = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  };
  let totalRevenue = 0;
  let paidRevenue = 0;
  let todayCount = 0;
  let todayRevenue = 0;
  let monthRevenue = 0;
  MOCK_BOOKINGS.forEach((b) => {
    byStatus[b.status] += 1;
    totalRevenue += b.total;
    if (b.paymentStatus === "paid") paidRevenue += b.total;
    if (b.date === today) {
      todayCount += 1;
      todayRevenue += b.total;
    }
    if (b.date.startsWith(thisMonth)) monthRevenue += b.total;
  });
  return {
    total: MOCK_BOOKINGS.length,
    byStatus,
    totalRevenue,
    paidRevenue,
    averageTicket: Math.round(totalRevenue / MOCK_BOOKINGS.length),
    todayCount,
    todayRevenue,
    monthRevenue,
  };
}
