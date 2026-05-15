// Unified site search — case-insensitive substring across all service catalogs.
//
// Importers:
//   - src/app/ara/page.tsx (server-side metadata + initial results)
//   - src/app/ara/SearchClient.tsx (client interactive)
// Affected: arama deneyimi (cross-category) + advanced filters.
// Data: SearchResult = normalized projection; slug + name + description + price.
// User verbatim: "searchAll fonksiyonuna filter parametreleri ekle:
//   { q, category, priceMin, priceMax, ratingMin, duration, sortBy }
//   Sort logic: popularity (reviewCount), price asc/desc, rating desc
//   Duration kategorize: durationMinutes veya duration string parse"

import { BALLOON_PACKAGES } from "@/data/services/balloons";
import {
  ACTIVITIES,
  TOURS,
  HOTELS,
  PACKAGES,
  TRANSFERS,
  KAPADOKYA_PILLARS,
} from "@/data/services/catalog";

export type SearchCategory =
  | "balloon"
  | "activity"
  | "tour"
  | "hotel"
  | "package"
  | "transfer"
  | "pillar";

export type DurationBucket =
  | "any"
  | "lt2h"
  | "2to4h"
  | "halfDay"
  | "fullDay"
  | "multiDay";

export type SortKey =
  | "popularity"
  | "priceAsc"
  | "priceDesc"
  | "ratingDesc"
  | "newest";

export interface SearchFilters {
  category?: SearchCategory | "all";
  priceMin?: number | null;
  priceMax?: number | null;
  ratingMin?: number | null;
  duration?: DurationBucket;
  currency?: "EUR" | "TRY" | "USD" | "any";
  sortBy?: SortKey;
}

export interface SearchResult {
  type: SearchCategory;
  slug: string;
  name: string;
  description: string;
  price: number | null;
  currency: "EUR" | "TRY" | "USD" | null;
  href: string;
  badge?: string;
  rating?: number;
  reviewCount?: number;
  duration?: string;
  durationMinutes?: number;
  marketPrice?: number;
}

const CATEGORY_LABEL_TR: Record<SearchCategory, string> = {
  balloon: "Balon Uçuşu",
  activity: "Aktivite",
  tour: "Tur",
  hotel: "Otel",
  package: "Paket",
  transfer: "Transfer",
  pillar: "Rehber",
};

const CATEGORY_HREF_BASE: Record<SearchCategory, string> = {
  balloon: "/balonlar",
  activity: "/aktiviteler",
  tour: "/turlar",
  hotel: "/oteller",
  package: "/paketler",
  transfer: "/transferler",
  pillar: "/kapadokya",
};

export function getCategoryLabel(category: SearchCategory): string {
  return CATEGORY_LABEL_TR[category];
}

export function getCategoryBaseHref(category: SearchCategory): string {
  return CATEGORY_HREF_BASE[category];
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("tr");
}

function matches(query: string, text: string): boolean {
  if (!query) return true;
  return normalize(text).includes(normalize(query));
}

// Parse Turkish duration strings into approximate minutes.
// Catalogs use strings like "2 saat", "3-4 saat", "Yarım gün", "Tam gün",
// "60+ dk", "75 dk", "1,5 saat", "Gece başı".
export function parseDurationMinutes(s: string | undefined): number | null {
  if (!s) return null;
  const lower = s.toLocaleLowerCase("tr").trim();
  if (/tam g[üu]n/.test(lower)) return 8 * 60;
  if (/yar[ıi]m g[üu]n/.test(lower)) return 4 * 60;
  if (/gece ba[sş][ıi]/.test(lower)) return 12 * 60;
  if (/[çc]ok g[üu]n|multi/.test(lower)) return 24 * 60;
  // "1,5 saat" / "2 saat" / "3-4 saat"
  const saatMatch = lower.match(/(\d+(?:[,.]\d+)?)(?:\s*-\s*(\d+(?:[,.]\d+)?))?\s*saat/);
  if (saatMatch) {
    const a = parseFloat(saatMatch[1].replace(",", "."));
    const b = saatMatch[2] ? parseFloat(saatMatch[2].replace(",", ".")) : a;
    return Math.round(((a + b) / 2) * 60);
  }
  // "60+ dk" / "75 dk"
  const dkMatch = lower.match(/(\d+)\s*\+?\s*dk/);
  if (dkMatch) return parseInt(dkMatch[1], 10);
  return null;
}

export function durationToBucket(minutes: number | null): DurationBucket {
  if (minutes === null) return "any";
  if (minutes >= 24 * 60) return "multiDay";
  if (minutes >= 6 * 60) return "fullDay";
  if (minutes >= 4 * 60) return "halfDay";
  if (minutes >= 2 * 60) return "2to4h";
  return "lt2h";
}

function durationMatches(target: DurationBucket, minutes: number | null): boolean {
  if (target === "any") return true;
  if (minutes === null) return false;
  return durationToBucket(minutes) === target;
}

function balloonToResult(): SearchResult[] {
  return BALLOON_PACKAGES.map((b) => ({
    type: "balloon" as const,
    slug: b.slug,
    name: b.name,
    description: b.shortDescription,
    price: b.adultPrice,
    currency: b.currency,
    href: `/rezervasyon/${b.slug}`,
    badge: b.badge,
    rating: b.rating,
    reviewCount: b.reviewCount,
    duration: b.duration,
    durationMinutes: b.durationMinutes,
    marketPrice: b.marketPrice,
  }));
}

function serviceToResult(
  items: typeof ACTIVITIES,
  type: SearchCategory
): SearchResult[] {
  return items.map((s) => ({
    type,
    slug: s.slug,
    name: s.name,
    description: s.shortDescription,
    price: s.adultPrice,
    currency: s.currency,
    href: `/rezervasyon/${s.slug}`,
    badge: s.badge,
    rating: s.rating,
    reviewCount: s.reviewCount,
    duration: s.duration,
    durationMinutes: parseDurationMinutes(s.duration) ?? undefined,
    marketPrice: s.marketPrice,
  }));
}

function pillarToResult(): SearchResult[] {
  return KAPADOKYA_PILLARS.map((p) => ({
    type: "pillar" as const,
    slug: p.slug,
    name: p.title,
    description: p.desc,
    price: null,
    currency: null,
    href: `/kapadokya/${p.slug}`,
  }));
}

export function getAllResults(): SearchResult[] {
  return [
    ...balloonToResult(),
    ...serviceToResult(ACTIVITIES, "activity"),
    ...serviceToResult(TOURS, "tour"),
    ...serviceToResult(HOTELS, "hotel"),
    ...serviceToResult(PACKAGES, "package"),
    ...serviceToResult(TRANSFERS, "transfer"),
    ...pillarToResult(),
  ];
}

export function searchAll(
  query: string,
  filtersOrCategory?: SearchFilters | SearchCategory | "all"
): SearchResult[] {
  // Backward compat: caller may pass just category string.
  const filters: SearchFilters =
    typeof filtersOrCategory === "string" || filtersOrCategory === undefined
      ? { category: filtersOrCategory ?? "all" }
      : filtersOrCategory;

  const {
    category = "all",
    priceMin = null,
    priceMax = null,
    ratingMin = null,
    duration = "any",
    currency = "any",
    sortBy = "popularity",
  } = filters;

  const all = getAllResults();
  const trimmed = (query ?? "").trim();
  let filtered = all.filter((r) => {
    if (category !== "all" && r.type !== category) return false;
    if (trimmed) {
      if (
        !matches(trimmed, r.name) &&
        !matches(trimmed, r.description) &&
        !matches(trimmed, r.slug)
      )
        return false;
    }
    // Price filter — skip when result has no price (pillars).
    if (priceMin !== null && (r.price === null || r.price < priceMin)) return false;
    if (priceMax !== null && (r.price === null || r.price > priceMax)) return false;
    // Rating filter.
    if (ratingMin !== null && (r.rating ?? 0) < ratingMin) return false;
    // Duration bucket.
    if (duration !== "any") {
      const mins =
        r.durationMinutes ?? parseDurationMinutes(r.duration) ?? null;
      if (!durationMatches(duration, mins)) return false;
    }
    // Currency filter.
    if (currency !== "any" && r.currency !== null && r.currency !== currency) return false;
    return true;
  });

  // Sort
  filtered = sortResults(filtered, sortBy, trimmed);
  return filtered;
}

function sortResults(
  list: SearchResult[],
  sortBy: SortKey,
  trimmedQuery: string
): SearchResult[] {
  const copy = [...list];
  switch (sortBy) {
    case "priceAsc":
      copy.sort((a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY));
      break;
    case "priceDesc":
      copy.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
      break;
    case "ratingDesc":
      copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case "newest":
      // Catalog has no createdAt; proxy via slug alphabetical fallback.
      copy.sort((a, b) => b.slug.localeCompare(a.slug));
      break;
    case "popularity":
    default: {
      copy.sort((a, b) => {
        // Name hits boosted when query present.
        if (trimmedQuery) {
          const aHit = matches(trimmedQuery, a.name) ? 0 : 1;
          const bHit = matches(trimmedQuery, b.name) ? 0 : 1;
          if (aHit !== bHit) return aHit - bHit;
        }
        const aPop = (a.reviewCount ?? 0) * (a.rating ?? 0);
        const bPop = (b.reviewCount ?? 0) * (b.rating ?? 0);
        return bPop - aPop;
      });
      break;
    }
  }
  return copy;
}

export function getCategoryCounts(query: string): Record<SearchCategory | "all", number> {
  const trimmed = (query ?? "").trim();
  const all = getAllResults();
  const result: Record<SearchCategory | "all", number> = {
    all: 0,
    balloon: 0,
    activity: 0,
    tour: 0,
    hotel: 0,
    package: 0,
    transfer: 0,
    pillar: 0,
  };
  all.forEach((r) => {
    const hit =
      !trimmed ||
      matches(trimmed, r.name) ||
      matches(trimmed, r.description) ||
      matches(trimmed, r.slug);
    if (hit) {
      result.all += 1;
      result[r.type] += 1;
    }
  });
  return result;
}

export function suggestFallback(limit = 4): SearchResult[] {
  return [
    ...balloonToResult().slice(0, 2),
    ...serviceToResult(PACKAGES, "package").slice(0, 1),
    ...serviceToResult(TOURS, "tour").slice(0, 1),
  ].slice(0, limit);
}
