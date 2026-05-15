// /ara — global site search results page (server shell + client interactive).
//
// Importers: Next.js App Router auto-discover (file-based routing).
// Linked-from: Header search icon, not-found.tsx form, SearchWidget destination override.
// Affected: cross-category arama deneyimi.
// Data: ?q=string & ?category=balloon|hotel|activity|tour|package|transfer|pillar|all
// User verbatim: "Metadata `Arama: \"{q}\" — Trip and Tick`, noindex"

import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "./SearchClient";

interface PageProps {
  searchParams?: { q?: string; category?: string };
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const q = (searchParams?.q ?? "").trim();
  return {
    title: q ? `Arama: "${q}" — Trip and Tick` : "Arama — Trip and Tick",
    description:
      "Trip and Tick katalogunda balon turu, otel, aktivite, gezi turu, paket ve transfer arayın.",
    robots: { index: false, follow: true },
  };
}

export default function AraPage({ searchParams }: PageProps) {
  const initialQ = (searchParams?.q ?? "").trim();
  const initialCategory = (searchParams?.category ?? "all").trim();
  return (
    <main className="min-h-screen bg-slate-50">
      <Suspense fallback={<div className="container-main py-16 text-center text-slate-500">Yükleniyor…</div>}>
        <SearchClient initialQuery={initialQ} initialCategory={initialCategory} />
      </Suspense>
    </main>
  );
}
