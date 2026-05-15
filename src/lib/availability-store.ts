// Server-side availability store (Faz 1: in-memory + opsiyonel JSON dosya persist).
// Faz 2'de Supabase tablo: availability(slug, date, status, remaining_slots, note).
//
// Importers:
//   - src/app/api/availability/route.ts (GET + POST)
// Affected: admin Takvim edit + booking step 2 doluluk sorgu.
// Data: In-memory Map<slug, Map<date, DayAvailability>>;
//       Dosya .next/cache/availability.json — { [slug]: DayAvailability[] }
//       Tarih: YYYY-MM-DD ISO.
// User verbatim: "doluluk oranlarini bizim elden ayarlayabilmemiz gerekiyor.
// mesela balon turunda veya atv yada at turunda doluluk oldugunda musteriye
// odeme yaptirmadan once bunu bilgilendirebilmemiz gerekiyor. bunun icinde
// elden de ayarlama yapabilmemiz gerekiyor."

import { promises as fs } from "node:fs";
import path from "node:path";
import {
  generateMockMonth,
  getDefaultCapacity,
  getStatusBySlots,
  type AvailabilityStatus,
  type DayAvailability,
} from "@/data/availability";

const CACHE_FILE = path.join(process.cwd(), ".next", "cache", "availability.json");

type SlugMap = Map<string, DayAvailability>;
type Store = Map<string, SlugMap>;

// Modul-level singleton (Node.js process icin korunur).
const g = globalThis as unknown as {
  __availabilityStore?: Store;
  __availabilityLoaded?: boolean;
};

function getStore(): Store {
  if (!g.__availabilityStore) {
    g.__availabilityStore = new Map();
  }
  return g.__availabilityStore;
}

function ensureSlugMap(slug: string): SlugMap {
  const store = getStore();
  let m = store.get(slug);
  if (!m) {
    m = new Map();
    store.set(slug, m);
  }
  return m;
}

function seedMonthIfEmpty(slug: string): void {
  const m = ensureSlugMap(slug);
  if (m.size > 0) return;
  const generated = generateMockMonth(slug);
  for (const day of generated) {
    m.set(day.date, day);
  }
}

export function getAvailability(slug: string, date: string): DayAvailability {
  seedMonthIfEmpty(slug);
  const m = ensureSlugMap(slug);
  const existing = m.get(date);
  if (existing) return existing;

  // Cache miss — deterministik mock fallback (slug+date hash).
  const total = getDefaultCapacity(slug);
  const startUtc = new Date(`${date}T00:00:00Z`);
  const oneDay = !Number.isNaN(startUtc.getTime())
    ? generateMockMonth(slug, startUtc)[0]
    : undefined;
  const day: DayAvailability = oneDay
    ? { ...oneDay, date }
    : {
        date,
        status: getStatusBySlots(total, total),
        remainingSlots: total,
        totalSlots: total,
      };
  m.set(date, day);
  return day;
}

export interface AvailabilityPatch {
  status?: AvailabilityStatus;
  remainingSlots?: number;
  totalSlots?: number;
  note?: string;
}

export function setAvailability(
  slug: string,
  date: string,
  patch: AvailabilityPatch
): DayAvailability {
  const current = getAvailability(slug, date);
  const totalSlots =
    patch.totalSlots ?? current.totalSlots ?? getDefaultCapacity(slug);
  const remainingSlots = Math.max(
    0,
    Math.min(totalSlots, patch.remainingSlots ?? current.remainingSlots)
  );
  // Explicit status; yoksa slot'lardan tureyen.
  const status: AvailabilityStatus =
    patch.status ?? getStatusBySlots(remainingSlots, totalSlots);

  const next: DayAvailability = {
    date,
    status,
    remainingSlots,
    totalSlots,
    note: patch.note !== undefined ? patch.note : current.note,
  };
  ensureSlugMap(slug).set(date, next);
  // Fire-and-forget persist (best effort).
  void saveToFile();
  return next;
}

export function getMonth(
  slug: string,
  year: number,
  month: number
): DayAvailability[] {
  // month 1..12
  seedMonthIfEmpty(slug);
  const m = ensureSlugMap(slug);
  const out: DayAvailability[] = [];
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let d = 1; d <= lastDay; d++) {
    const iso = `${year.toString().padStart(4, "0")}-${month
      .toString()
      .padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
    out.push(m.get(iso) ?? getAvailability(slug, iso));
  }
  return out;
}

export function getRange(slug: string, from: string, to: string): DayAvailability[] {
  const out: DayAvailability[] = [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return out;
  const cursor = new Date(start);
  let safety = 0;
  while (cursor <= end && safety < 366) {
    const iso = cursor.toISOString().slice(0, 10);
    out.push(getAvailability(slug, iso));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    safety++;
  }
  return out;
}

export async function loadFromFile(): Promise<void> {
  if (g.__availabilityLoaded) return;
  g.__availabilityLoaded = true;
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Record<string, DayAvailability[]>;
    const store = getStore();
    for (const [slug, days] of Object.entries(parsed)) {
      const m = new Map<string, DayAvailability>();
      for (const day of days) {
        m.set(day.date, day);
      }
      store.set(slug, m);
    }
  } catch {
    // Dosya yok / bozuk — sessizce gec.
  }
}

export async function saveToFile(): Promise<void> {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    const store = getStore();
    const out: Record<string, DayAvailability[]> = {};
    for (const [slug, m] of store.entries()) {
      out[slug] = Array.from(m.values()).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    }
    await fs.writeFile(CACHE_FILE, JSON.stringify(out, null, 2), "utf8");
  } catch (err) {
    console.warn("[availability-store] saveToFile failed", err);
  }
}
