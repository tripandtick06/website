// Availability data + helpers (Faz 1 mock).
//
// Importers:
//   - src/lib/availability-store.ts (server-side store, yeni)
//   - src/app/api/availability/route.ts (GET/POST API, yeni)
//   - src/app/admin/page.tsx (Takvim tabı, hizmet listesi)
//   - src/app/rezervasyon/[slug]/BookingClient.tsx (booking step 2 — client'a sadece status+slot expose)
//
// Affected: rezervasyon ödeme öncesi doluluk kontrolu + admin elden edit.
//
// Data: DayAvailability { date YYYY-MM-DD, status, remainingSlots, totalSlots, note? }
//       AvailabilityStatus enum = "available" | "limited" | "full"
//
// User verbatim: "doluluk oranlarini bizim elden ayarlayabilmemiz gerekiyor.
// mesela balon turunda veya atv yada at turunda doluluk oldugunda musteriye
// odeme yaptirmadan once bunu bilgilendirebilmemiz gerekiyor. bunun icinde
// elden de ayarlama yapabilmemiz gerekiyor."

export type AvailabilityStatus = "available" | "limited" | "full";

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  status: AvailabilityStatus;
  remainingSlots: number;
  totalSlots: number;
  note?: string;
}

// Slug bazlı toplam günlük kapasite.
// Balon: sepet × sefer. ATV/at/jeep: günlük operasyon kapasitesi.
export const DEFAULT_CAPACITY: Record<string, number> = {
  // Balon paketleri
  "standart-balon-ucusu": 80, // 4 sefer × 20 sepet
  "deluxe-balon-ucusu": 32, // 2 sefer × 16 (kucuk sepet)
  "romantik-ozel-balon": 8, // özel sepet
  // ATV
  "atv-standart": 30,
  "atv-sunrise": 24,
  "atv-sunset": 30,
  // Jeep
  "jeep-standart": 25,
  "jeep-sunrise": 20,
  "jeep-sunset": 25,
  // At
  "at-standart": 20,
  "at-sunrise": 20,
  "at-sunset": 20,
  // Turlar
  "kirmizi-tur": 50,
  "yesil-tur": 45,
  "mix-tur": 45,
  "sari-tur": 30,
  "gun-batimi-turu": 40,
  "instagram-turu": 20,
  "yeralti-turu": 50,
  // Hamam
  "hamam-standart": 40,
  "hamam-deluxe": 20,
  // Türk Gecesi
  "turk-gecesi-yemekli": 80,
  "turk-gecesi-yemeksiz": 80,
  // Microlight
  "microlight-standart": 12,
  "microlight-deluxe": 8,
  // Oteller
  "magara-otel-deluxe": 15,
  "magara-otel-suit": 8,
  "butik-otel-standart": 24,
  "resort-aile": 30,
  // Paketler
  "tam-gun-paket": 30,
  "balayi-paketi": 10,
  "macera-paketi": 20,
  "aile-paketi": 16,
  "evlilik-teklifi": 6,
  "kurumsal-paket": 40,
  // Transferler
  "nev-otel": 60,
  "kayseri-otel": 60,
  "minibus-grup": 40,
  "vip-arac": 20,
};

const FALLBACK_CAPACITY = 40;

export function getDefaultCapacity(slug: string): number {
  return DEFAULT_CAPACITY[slug] ?? FALLBACK_CAPACITY;
}

export function getStatusBySlots(
  remaining: number,
  total: number
): AvailabilityStatus {
  if (remaining <= 0) return "full";
  if (remaining <= 3) return "limited";
  // Toplam %15 altına düştüyse limited (görsel sinyal)
  if (total > 20 && remaining / total <= 0.15) return "limited";
  return "available";
}

// Deterministik hash — slug + date -> 0..99 (FNV-1a)
function hashSeed(slug: string, date: string): number {
  const s = `${slug}|${date}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 100;
}

function isWeekend(date: string): boolean {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDay(); // 0=Pazar, 6=Cumartesi
  return day === 0 || day === 6;
}

function addDaysIso(start: Date, n: number): string {
  const d = new Date(start);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Slug bazlı 31 günlük deterministik mock takvim.
 * Hafta sonları daha dolu, dağılım ~ %70 available / %20 limited / %10 full.
 * Aynı (slug, startDate) → aynı çıktı.
 */
export function generateMockMonth(
  slug: string,
  startDate?: Date
): DayAvailability[] {
  const total = getDefaultCapacity(slug);
  const start = startDate ?? new Date();
  start.setUTCHours(0, 0, 0, 0);

  const out: DayAvailability[] = [];
  for (let i = 0; i < 31; i++) {
    const dateIso = addDaysIso(start, i);
    const seed = hashSeed(slug, dateIso);
    const weekendBoost = isWeekend(dateIso) ? 20 : 0;
    const effective = (seed + weekendBoost) % 100;

    let remaining: number;
    if (effective >= 90) {
      remaining = 0; // full
    } else if (effective >= 70) {
      remaining = Math.max(1, Math.min(3, Math.round((100 - effective) / 10))); // limited
    } else {
      // available — %20..%90 müsait
      const pct = 0.2 + (70 - effective) / 100;
      remaining = Math.max(4, Math.round(total * pct));
    }

    const status = getStatusBySlots(remaining, total);
    out.push({
      date: dateIso,
      status,
      remainingSlots: remaining,
      totalSlots: total,
    });
  }
  return out;
}

// Statik mock — server-side store cache miss durumunda generateMockMonth lazy çağrılır.
export const MOCK_AVAILABILITY: Record<string, DayAvailability[]> = {};
