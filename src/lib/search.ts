// Unified site search — case-insensitive substring across all service catalogs.
//
// Importers:
//   - src/app/ara/page.tsx (server-side metadata + initial results)
//   - src/app/ara/SearchClient.tsx (client interactive)
// Affected: arama deneyimi (cross-category).
// Data: SearchResult = normalized projection; slug + name + description + price.
// User verbatim: "src/lib/search.ts YENI: searchAll(query, category?). Tum hizmet
// katalogtan toplu sorgu (BALLOON_PACKAGES, ACTIVITIES, TOURS, HOTELS, PACKAGES, TRANSFERS, blog)."

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
  duration?: string;
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
    duration: b.duration,
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
    duration: s.duration,
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
  category?: SearchCategory | "all"
): SearchResult[] {
  const all = getAllResults();
  const trimmed = (query ?? "").trim();
  const filtered = all.filter((r) => {
    if (category && category !== "all" && r.type !== category) return false;
    if (!trimmed) return true;
    return (
      matches(trimmed, r.name) ||
      matches(trimmed, r.description) ||
      matches(trimmed, r.slug)
    );
  });
  if (trimmed) {
    filtered.sort((a, b) => {
      const aNameHit = matches(trimmed, a.name) ? 0 : 1;
      const bNameHit = matches(trimmed, b.name) ? 0 : 1;
      if (aNameHit !== bNameHit) return aNameHit - bNameHit;
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  }
  return filtered;
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
