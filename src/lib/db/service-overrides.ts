// Service overrides DB layer — admin gunluk fiyat/iptal/rotar override.
//
// Importers (planned):
//   - src/app/api/price/route.ts (public GET)
//   - src/app/api/admin/service-override/route.ts (admin POST/GET/DELETE)
//   - src/app/admin/fiyat/page.tsx (admin UI)
// Affected: BookingClient fiyat fetch + iptal/rotar banner.
// Data: service_overrides tablo — PK (service_slug, date), price_override nullable,
//        status enum (active/cancelled/delayed/sold_out), delay_minutes INT.
//        Date format: YYYY-MM-DD. Datetime: ISO 8601 TIMESTAMPTZ.

import { supabaseAdmin, supabaseEnabled } from "@/lib/supabase";

export type ServiceOverrideStatus = "active" | "cancelled" | "delayed" | "sold_out";

export interface ServiceOverride {
  serviceSlug: string;
  date: string;
  priceOverride: number | null;
  currency: string;
  status: ServiceOverrideStatus;
  cancellationReason: string | null;
  delayMinutes: number | null;
  note: string | null;
  updatedBy: string | null;
  updatedAt: string;
}

interface OverrideRow {
  service_slug: string;
  date: string;
  price_override: number | null;
  currency: string | null;
  status: string;
  cancellation_reason: string | null;
  delay_minutes: number | null;
  note: string | null;
  updated_by: string | null;
  updated_at: string;
}

// In-memory fallback (Supabase yokken). Production'da DB.
const memStore = new Map<string, ServiceOverride>();
const key = (slug: string, date: string) => `${slug}:${date}`;

function rowToOverride(r: OverrideRow): ServiceOverride {
  return {
    serviceSlug: r.service_slug,
    date: r.date,
    priceOverride: r.price_override,
    currency: r.currency ?? "EUR",
    status: (r.status as ServiceOverrideStatus) ?? "active",
    cancellationReason: r.cancellation_reason,
    delayMinutes: r.delay_minutes,
    note: r.note,
    updatedBy: r.updated_by,
    updatedAt: r.updated_at,
  };
}

export async function getOverride(slug: string, date: string): Promise<ServiceOverride | null> {
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    return memStore.get(key(slug, date)) ?? null;
  }
  const { data, error } = await client
    .from("service_overrides")
    .select("*")
    .eq("service_slug", slug)
    .eq("date", date)
    .maybeSingle();
  if (error) {
    console.error("[db/service-overrides] getOverride failed", error.message);
    return memStore.get(key(slug, date)) ?? null;
  }
  return data ? rowToOverride(data as OverrideRow) : null;
}

export async function listOverrides(opts: {
  slug?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ServiceOverride[]> {
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    let arr = Array.from(memStore.values());
    if (opts.slug) arr = arr.filter((o) => o.serviceSlug === opts.slug);
    if (opts.startDate) arr = arr.filter((o) => o.date >= opts.startDate!);
    if (opts.endDate) arr = arr.filter((o) => o.date <= opts.endDate!);
    return arr.sort((a, b) => (a.date < b.date ? -1 : 1));
  }
  let q = client.from("service_overrides").select("*");
  if (opts.slug) q = q.eq("service_slug", opts.slug);
  if (opts.startDate) q = q.gte("date", opts.startDate);
  if (opts.endDate) q = q.lte("date", opts.endDate);
  const { data, error } = await q.order("date", { ascending: true });
  if (error) {
    console.error("[db/service-overrides] listOverrides failed", error.message);
    return [];
  }
  return ((data ?? []) as OverrideRow[]).map(rowToOverride);
}

export interface OverridePatch {
  priceOverride?: number | null;
  currency?: string;
  status?: ServiceOverrideStatus;
  cancellationReason?: string | null;
  delayMinutes?: number | null;
  note?: string | null;
  updatedBy?: string | null;
}

export async function upsertOverride(
  slug: string,
  date: string,
  patch: OverridePatch
): Promise<ServiceOverride> {
  const client = supabaseAdmin();
  const now = new Date().toISOString();

  if (!supabaseEnabled || !client) {
    const existing = memStore.get(key(slug, date));
    const merged: ServiceOverride = {
      serviceSlug: slug,
      date,
      priceOverride: patch.priceOverride !== undefined ? patch.priceOverride : existing?.priceOverride ?? null,
      currency: patch.currency ?? existing?.currency ?? "EUR",
      status: patch.status ?? existing?.status ?? "active",
      cancellationReason: patch.cancellationReason !== undefined ? patch.cancellationReason : existing?.cancellationReason ?? null,
      delayMinutes: patch.delayMinutes !== undefined ? patch.delayMinutes : existing?.delayMinutes ?? null,
      note: patch.note !== undefined ? patch.note : existing?.note ?? null,
      updatedBy: patch.updatedBy ?? existing?.updatedBy ?? null,
      updatedAt: now,
    };
    memStore.set(key(slug, date), merged);
    return merged;
  }

  const row: Record<string, unknown> = {
    service_slug: slug,
    date,
    updated_at: now,
  };
  if (patch.priceOverride !== undefined) row.price_override = patch.priceOverride;
  if (patch.currency !== undefined) row.currency = patch.currency;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.cancellationReason !== undefined) row.cancellation_reason = patch.cancellationReason;
  if (patch.delayMinutes !== undefined) row.delay_minutes = patch.delayMinutes;
  if (patch.note !== undefined) row.note = patch.note;
  if (patch.updatedBy !== undefined) row.updated_by = patch.updatedBy;

  const { data, error } = await client
    .from("service_overrides")
    .upsert(row, { onConflict: "service_slug,date" })
    .select()
    .single();
  if (error) {
    console.error("[db/service-overrides] upsertOverride failed", error.message);
    throw new Error(error.message);
  }
  return rowToOverride(data as OverrideRow);
}

export async function deleteOverride(slug: string, date: string): Promise<void> {
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    memStore.delete(key(slug, date));
    return;
  }
  const { error } = await client
    .from("service_overrides")
    .delete()
    .eq("service_slug", slug)
    .eq("date", date);
  if (error) {
    console.error("[db/service-overrides] deleteOverride failed", error.message);
    throw new Error(error.message);
  }
}

export async function bulkCancel(opts: {
  slugs: string[];
  date: string;
  reason: string;
  updatedBy?: string;
}): Promise<ServiceOverride[]> {
  const results: ServiceOverride[] = [];
  for (const slug of opts.slugs) {
    const o = await upsertOverride(slug, opts.date, {
      status: "cancelled",
      cancellationReason: opts.reason,
      updatedBy: opts.updatedBy,
    });
    results.push(o);
  }
  return results;
}
