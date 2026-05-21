"use client";

// Client wrapper for /ara — holds Suspense + i18n fallback.
// Importers: src/app/[locale]/ara/page.tsx (server shell)
// Affected: yukleniyor fallback string, SearchClient pass-through
// User verbatim: "SERVER→CLIENT SPLIT: JSX gövdesi YENİ <Sayfa>Content.tsx"

import { Suspense } from "react";
import { useT } from "@/lib/i18n/I18nProvider";
import { SearchClient } from "./SearchClient";

interface AraContentProps {
  initialQ: string;
  initialCategory: string;
  initialPriceMin?: number | null;
  initialPriceMax?: number | null;
  initialRatingMin?: number | null;
  initialDuration?: string;
  initialCurrency?: string;
  initialSort?: string;
}

export function AraContent({
  initialQ,
  initialCategory,
  initialPriceMin,
  initialPriceMax,
  initialRatingMin,
  initialDuration,
  initialCurrency,
  initialSort,
}: AraContentProps) {
  const t = useT();
  return (
    <main className="min-h-screen bg-slate-50">
      <Suspense
        fallback={
          <div className="container-main py-16 text-center text-slate-500">
            {t.page.ara.yukleniyor}
          </div>
        }
      >
        <SearchClient
          initialQuery={initialQ}
          initialCategory={initialCategory}
          initialPriceMin={initialPriceMin}
          initialPriceMax={initialPriceMax}
          initialRatingMin={initialRatingMin}
          initialDuration={initialDuration}
          initialCurrency={initialCurrency}
          initialSort={initialSort}
        />
      </Suspense>
    </main>
  );
}
