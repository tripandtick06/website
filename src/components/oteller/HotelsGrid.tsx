"use client";

// Oteller sayfasi filter-aware grid — tip filtresi + localStorage persist.
//
// Importers: src/app/oteller/page.tsx (renders <HotelsGrid hotels={HOTELS} />)
// Affected: oteller listing — kullanici tip-bazli filtreler.
// Data: HOTELS prop (ServiceItem[]); localStorage 'tripandtick:oteller:typeFilter'
//        (string: all|magara|butik|resort|glamping|apart). Slug pattern matrix:
//          magara   -> includes("magara")
//          butik    -> includes("butik")
//          resort   -> startsWith("resort")
//          glamping -> startsWith("glamping")
//          apart    -> startsWith("apart")
// User verbatim: "Tip filtresi: 'Tümü / Mağara / Butik / Resort / Glamping /
// Apart' filter chips; Slug bazli kategorize et (slug.includes()); Filter
// state localStorage."

import { useEffect, useMemo, useState } from "react";
import { ServiceCard } from "@/components/layout/ServiceCard";
import { cn } from "@/lib/utils";
import type { ServiceItem } from "@/data/services/catalog";

const STORAGE_KEY = "tripandtick:oteller:typeFilter";

type TypeId = "all" | "magara" | "butik" | "resort" | "glamping" | "apart";

const TYPES: { id: TypeId; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "magara", label: "Mağara" },
  { id: "butik", label: "Butik" },
  { id: "resort", label: "Resort" },
  { id: "glamping", label: "Glamping" },
  { id: "apart", label: "Apart" },
];

function matches(hotel: ServiceItem, type: TypeId): boolean {
  if (type === "all") return true;
  if (type === "magara") return hotel.slug.includes("magara");
  if (type === "butik") return hotel.slug.includes("butik");
  if (type === "resort") return hotel.slug.startsWith("resort");
  if (type === "glamping") return hotel.slug.startsWith("glamping");
  if (type === "apart") return hotel.slug.startsWith("apart");
  return true;
}

export function HotelsGrid({ hotels }: { hotels: ServiceItem[] }) {
  const [type, setType] = useState<TypeId>("all");
  const [hydrated, setHydrated] = useState(false);

  // localStorage hydrate (1 kere)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && TYPES.some((t) => t.id === saved)) {
      setType(saved as TypeId);
    }
    setHydrated(true);
  }, []);

  // localStorage persist (hydrate sonrasi)
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, type);
  }, [type, hydrated]);

  const filtered = useMemo(
    () => hotels.filter((h) => matches(h, type)),
    [hotels, type]
  );

  const counts = useMemo(() => {
    const m: Record<TypeId, number> = {
      all: hotels.length,
      magara: 0,
      butik: 0,
      resort: 0,
      glamping: 0,
      apart: 0,
    };
    hotels.forEach((h) => {
      if (h.slug.includes("magara")) m.magara += 1;
      if (h.slug.includes("butik")) m.butik += 1;
      if (h.slug.startsWith("resort")) m.resort += 1;
      if (h.slug.startsWith("glamping")) m.glamping += 1;
      if (h.slug.startsWith("apart")) m.apart += 1;
    });
    return m;
  }, [hotels]);

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-2 mb-8"
        role="tablist"
        aria-label="Otel tipi filtresi"
      >
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            role="tab"
            aria-selected={type === t.id}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
              type === t.id
                ? "bg-accent border-accent text-white"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            <span>{t.label}</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                type === t.id ? "bg-white/20" : "bg-slate-100 text-slate-500"
              )}
            >
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center bg-white rounded-2xl p-8 border border-slate-200">
          <p className="text-slate-500">
            Bu kategoride otel bulunamadı. Lütfen başka bir filtre seçin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <ServiceCard key={item.slug} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
