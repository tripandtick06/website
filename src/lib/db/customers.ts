// Customer DB layer — Supabase varsa CRUD, yoksa mock-customers.ts fallback.
//
// Importers:
//   - src/lib/db/bookings.ts (future: upsert customer before booking)
//   - src/app/api/booking/route.ts (indirect)
//   - src/app/admin/* (Musteriler tab)
// Affected: e-posta unique customer, loyalty puan ekleme.
// Data: customers tablosu — id UUID, email UNIQUE, loyalty_points INTEGER.
//        loyalty_transactions tablosu — points INTEGER, transaction_type enum,
//        FK booking_id (TT-XXXXXXXX).
// User verbatim: "src/lib/db/customers.ts YENI — Customer CRUD:
//        upsertCustomer, getCustomerByEmail, getCustomerById, incrementLoyaltyPoints"

import { supabaseAdmin, supabaseEnabled } from "@/lib/supabase";
import { MOCK_CUSTOMERS, type MockCustomer } from "@/data/mock-customers";

export type CustomerSegment = "new" | "returning" | "vip" | "cancelled";

export interface DBCustomer {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  nationality: string | null;
  language: string;
  segment: CustomerSegment;
  loyaltyPoints: number;
  referralCode: string | null;
  referredBy: string | null;
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerUpsertInput {
  fullName?: string;
  phone?: string;
  nationality?: string;
  language?: string;
  segment?: CustomerSegment;
}

interface CustomerRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  nationality: string | null;
  language: string | null;
  segment: string | null;
  loyalty_points: number | null;
  referral_code: string | null;
  referred_by: string | null;
  total_bookings: number | null;
  total_spent: number | string | null;
  created_at: string;
  updated_at: string;
}

function rowToDB(r: CustomerRow): DBCustomer {
  return {
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    phone: r.phone,
    nationality: r.nationality,
    language: r.language ?? "tr",
    segment: (r.segment as CustomerSegment) ?? "new",
    loyaltyPoints: r.loyalty_points ?? 0,
    referralCode: r.referral_code,
    referredBy: r.referred_by,
    totalBookings: r.total_bookings ?? 0,
    totalSpent: Number(r.total_spent ?? 0),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mockToDB(m: MockCustomer): DBCustomer {
  return {
    id: m.id,
    email: m.email,
    fullName: m.fullName,
    phone: m.phone,
    nationality: m.nationality,
    language: m.language,
    segment: m.segment,
    loyaltyPoints: 0,
    referralCode: null,
    referredBy: null,
    totalBookings: m.totalBookings,
    totalSpent: m.totalSpent,
    createdAt: m.createdAt,
    updatedAt: m.lastActivity,
  };
}

/**
 * E-posta ile customer upsert. Varsa update, yoksa create.
 */
export async function upsertCustomer(
  email: string,
  data: CustomerUpsertInput
): Promise<DBCustomer | null> {
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    const existing = MOCK_CUSTOMERS.find(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) return mockToDB(existing);
    return {
      id: `MOCK-${Date.now()}`,
      email,
      fullName: data.fullName ?? null,
      phone: data.phone ?? null,
      nationality: data.nationality ?? null,
      language: data.language ?? "tr",
      segment: data.segment ?? "new",
      loyaltyPoints: 0,
      referralCode: null,
      referredBy: null,
      totalBookings: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  const row: Record<string, unknown> = { email: email.toLowerCase() };
  if (data.fullName !== undefined) row.full_name = data.fullName;
  if (data.phone !== undefined) row.phone = data.phone;
  if (data.nationality !== undefined) row.nationality = data.nationality;
  if (data.language !== undefined) row.language = data.language;
  if (data.segment !== undefined) row.segment = data.segment;

  const { data: result, error } = await client
    .from("customers")
    .upsert(row, { onConflict: "email" })
    .select("*")
    .maybeSingle();
  if (error) {
    console.error("[db/customers] upsert failed", error.message);
    return null;
  }
  if (!result) return null;
  return rowToDB(result as CustomerRow);
}

export async function getCustomerByEmail(email: string): Promise<DBCustomer | null> {
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    const m = MOCK_CUSTOMERS.find(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );
    return m ? mockToDB(m) : null;
  }
  const { data, error } = await client
    .from("customers")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error) {
    console.error("[db/customers] getByEmail failed", error.message);
    return null;
  }
  return data ? rowToDB(data as CustomerRow) : null;
}

export async function getCustomerById(id: string): Promise<DBCustomer | null> {
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    const m = MOCK_CUSTOMERS.find((c) => c.id === id);
    return m ? mockToDB(m) : null;
  }
  const { data, error } = await client
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[db/customers] getById failed", error.message);
    return null;
  }
  return data ? rowToDB(data as CustomerRow) : null;
}

export async function incrementLoyaltyPoints(
  customerId: string,
  points: number,
  transactionType: "earn" | "redeem" | "referral" | "bonus" | "expire",
  bookingId?: string,
  description?: string
): Promise<void> {
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    console.info(
      "[db/customers] mock incrementLoyalty",
      JSON.stringify({ customerId, points, transactionType, bookingId })
    );
    return;
  }
  // 1. Transaction kaydet
  const { error: txErr } = await client.from("loyalty_transactions").insert({
    customer_id: customerId,
    points,
    transaction_type: transactionType,
    booking_id: bookingId ?? null,
    description: description ?? null,
  });
  if (txErr) {
    console.error("[db/customers] loyalty insert failed", txErr.message);
    return;
  }
  // 2. Toplam puan guncelle (read+write fallback — RPC ileride).
  const { data: cust } = await client
    .from("customers")
    .select("loyalty_points")
    .eq("id", customerId)
    .maybeSingle();
  const current = cust?.loyalty_points ?? 0;
  const next = Math.max(0, current + points);
  const { error: upErr } = await client
    .from("customers")
    .update({ loyalty_points: next })
    .eq("id", customerId);
  if (upErr) {
    console.error("[db/customers] loyalty point update failed", upErr.message);
  }
}
