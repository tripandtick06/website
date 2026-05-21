// /ara — global site search results page (server shell + client interactive).
//
// Importers: Next.js App Router auto-discover (file-based routing).
// Linked-from: Header search icon, not-found.tsx form, SearchWidget destination override.
// Affected: cross-category arama deneyimi + advanced filters.
// Data: ?q & ?category & ?priceMin & ?priceMax & ?rating & ?duration & ?currency & ?sort
// User verbatim: "URL state: filters URL query'ye sync"

import type { Metadata } from "next";
import { AraContent } from "./AraContent";

export const runtime = "edge";

interface PageProps {
  searchParams?: {
    q?: string;
    category?: string;
    priceMin?: string;
    priceMax?: string;
    rating?: string;
    duration?: string;
    currency?: string;
    sort?: string;
  };
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const q = (searchParams?.q ?? "").trim();
  return {
    title: q ? `Arama: "${q}" — Trip and Tick` : "Arama — Trip and Tick",
    description:
      "Trip and Tick katalogunda balon turu, otel, aktivite, gezi turu, paket ve transfer arayın. Fiyat, puan, süre ve para birimine göre filtreleyin.",
    robots: { index: false, follow: true },
  };
}

function parseIntOrNull(v: string | undefined): number | null {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function parseFloatOrNull(v: string | undefined): number | null {
  if (!v) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

export default function AraPage({ searchParams }: PageProps) {
  const initialQ = (searchParams?.q ?? "").trim();
  const initialCategory = (searchParams?.category ?? "all").trim();
  const initialPriceMin = parseIntOrNull(searchParams?.priceMin);
  const initialPriceMax = parseIntOrNull(searchParams?.priceMax);
  const initialRatingMin = parseFloatOrNull(searchParams?.rating);
  const initialDuration = (searchParams?.duration ?? "any").trim();
  const initialCurrency = (searchParams?.currency ?? "any").trim();
  const initialSort = (searchParams?.sort ?? "popularity").trim();
  return (
    <AraContent
      initialQ={initialQ}
      initialCategory={initialCategory}
      initialPriceMin={initialPriceMin}
      initialPriceMax={initialPriceMax}
      initialRatingMin={initialRatingMin}
      initialDuration={initialDuration}
      initialCurrency={initialCurrency}
      initialSort={initialSort}
    />
  );
}
