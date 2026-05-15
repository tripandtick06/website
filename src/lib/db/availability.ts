// Availability DB layer — Supabase varsa DB, yoksa in-memory fallback.
//
// Importers:
//   - src/app/api/availability/route.ts (GET + POST) [future hook-up]
//   - src/app/admin/* (Takvim tab)
// Affected: doluluk sorgu + elden edit. Env yokken availability-store.ts kullanir.
// Data: availability tablosu — UNIQUE(service_slug, date),
//        date YYYY-MM-DD, remaining_slots/total_slots INTEGER,
//        status TEXT in ('available','limited','full','closed').
// User verbatim: "src/lib/db/availability.ts YENI — Availability DB layer:
//        getAvailability/setAvailability/getMonth. Mevcut in-memory
//        src/lib/availability-store.ts fallback olarak kullansin."

import { supabaseAdmin, supabaseEnabled } from "@/lib/supabase";
import * as store from "@/lib/availability-store";
import type { DayAvailability, AvailabilityStatus } from "@/data/availability";

export type DBAvailabilityStatus = AvailabilityStatus | "closed";

export interface DBAvailability {
  serviceSlug: string;
  date: string;
  status: DBAvailabilityStatus;
  remainingSlots: number;
  totalSlots: number;
  note?: string | null;
}

interface AvailabilityRow {
  service_slug: string;
  date: string;
  status: string;
  remaining_slots: number;
  total_slots: number;
  note: string | null;
}

function rowToDB(r: AvailabilityRow): DBAvailability {
  return {
    serviceSlug: r.service_slug,
    date: r.date,
    status: (r.status as DBAvailabilityStatus) ?? "available",
    remainingSlots: r.remaining_slots,
    totalSlots: r.total_slots,
    note: r.note,
  };
}

function dayToDB(slug: string, d: DayAvailability): DBAvailability {
  return {
    serviceSlug: slug,
    date: d.date,
    status: d.status,
    remainingSlots: d.remainingSlots,
    totalSlots: d.totalSlots,
    note: d.note ?? null,
  };
}

export async function getAvailability(
  slug: string,
  date: string
): Promise<DBAvailability | null> {
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    const day = store.getAvailability(slug, date);
    return day ? dayToDB(slug, day) : null;
  }
  const { data, error } = await client
    .from("availability")
    .select("*")
    .eq("service_slug", slug)
    .eq("date", date)
    .maybeSingle();
  if (error) {
    console.error("[db/availability] getAvailability failed", error.message);
    const day = store.getAvailability(slug, date);
    return day ? dayToDB(slug, day) : null;
  }
  if (!data) {
    // DB'de yoksa store mock'tan tureyen — DB'ye write-back.
    const day = store.getAvailability(slug, date);
    if (day) {
      await setAvailability(slug, date, {
        status: day.status,
        remainingSlots: day.remainingSlots,
        totalSlots: day.totalSlots,
        note: day.note,
      });
      return dayToDB(slug, day);
    }
    return null;
  }
  return rowToDB(data as AvailabilityRow);
}

export interface AvailabilityPatch {
  status?: DBAvailabilityStatus;
  remainingSlots?: number;
  totalSlots?: number;
  note?: string | null;
}

export async function setAvailability(
  slug: string,
  date: string,
  patch: AvailabilityPatch
): Promise<void> {
  const client = supabaseAdmin();
  if (!supabaseEnabled || !client) {
    // Store fallback — sadece 3-status (closed map -> full).
    const storeStatus: AvailabilityStatus | undefined =
      patch.status === "closed" ? "full" : patch.status;
    store.setAvailability(slug, date, {
      status: storeStatus,
      remainingSlots: patch.remainingSlots,
      totalSlots: patch.totalSlots,
      note: patch.note ?? undefined,
    });
    return;
  }
  const row: Record<string, unknown> = {
    service_slug: slug,
    date,
  };
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.remainingSlots !== undefined) row.remaining_slots = patch.remainingSlots;
  if (patch.totalSlots !== undefined) row.total_slots = patch.totalSlots;
  if (patch.note !== undefined) row.note = patch.note;

  // Upsert by (service_slug, date) unique constraint.
  const { error } = await client
    .from("availability")
    .upsert(row, { onConflict: "service_slug,date" });
  if (error) {
    console.error("[db/availability] setAvailability failed", error.message);
  }
}

export async function getMonth(
  slug: string,
  year: number,
  month: number
): Promise<DBAvailability[]> {
  const client = supabaseAdmin();
  const firstDay = `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-01`;
  const lastDayDate = new Date(Date.UTC(year, month, 0));
  const last = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${lastDayDate
    .getUTCDate()
    .toString()
    .padStart(2, "0")}`;

  if (!supabaseEnabled || !client) {
    return store.getMonth(slug, year, month).map((d) => dayToDB(slug, d));
  }
  const { data, error } = await client
    .from("availability")
    .select("*")
    .eq("service_slug", slug)
    .gte("date", firstDay)
    .lte("date", last)
    .order("date", { ascending: true });
  if (error) {
    console.error("[db/availability] getMonth failed", error.message);
    return store.getMonth(slug, year, month).map((d) => dayToDB(slug, d));
  }
  const rows = ((data ?? []) as AvailabilityRow[]).map(rowToDB);
  if (rows.length === 0) {
    return store.getMonth(slug, year, month).map((d) => dayToDB(slug, d));
  }
  return rows;
}
