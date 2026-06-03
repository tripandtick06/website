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
import { HotelCard } from "@/components/oteller/HotelCard";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/I18nProvider";
import type { ServiceItem } from "@/data/services/catalog";

const STORAGE_KEY = "tripandtick:oteller:tierFilter";

type TierId = "all" | "budget" | "mid" | "lux";

// Stable id list — localStorage validation (TIERS with labels is render-scoped).
const TIER_IDS: readonly TierId[] = ["all", "budget", "mid", "lux"];

function matches(hotel: ServiceItem, tier: TierId): boolean {
  if (tier === "all") return true;
  return hotel.tier === tier;
}

export function HotelsGrid({ hotels }: { hotels: ServiceItem[] }) {
  const t = useT();
  const TIERS: { id: TierId; label: string }[] = [
    { id: "all", label: t.component.oteller.hotels_grid.tier_tumu },
    { id: "budget", label: t.component.oteller.hotels_grid.tier_ucuz_ekonomik },
    { id: "mid", label: t.component.oteller.hotels_grid.tier_orta_halli },
    { id: "lux", label: t.component.oteller.hotels_grid.tier_luks_premium },
  ];
  const [type, setType] = useState<TierId>("all");
  const [hydrated, setHydrated] = useState(false);

  // localStorage hydrate (1 kere)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && TIER_IDS.includes(saved as TierId)) {
      setType(saved as TierId);
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
    const m: Record<TierId, number> = {
      all: hotels.length,
      budget: 0,
      mid: 0,
      lux: 0,
    };
    hotels.forEach((h) => {
      if (h.tier === "budget") m.budget += 1;
      else if (h.tier === "mid") m.mid += 1;
      else if (h.tier === "lux") m.lux += 1;
    });
    return m;
  }, [hotels]);

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-2 mb-8"
        role="tablist"
        aria-label={t.component.oteller.hotels_grid.div_aria_label_otel_tipi}
      >
        {TIERS.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setType(tier.id)}
            role="tab"
            aria-selected={type === tier.id}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-booking/[0.4]",
              // orange = CTA-only; filtre aktif durumu navy (chrome) (3-renk lock).
              type === tier.id
                ? "bg-primary border-primary text-white"
                : "bg-white border-slate-200 text-slate-700 hover:border-booking hover:text-booking"
            )}
          >
            <span>{tier.label}</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                type === tier.id ? "bg-white/20" : "bg-slate-100 text-slate-500"
              )}
            >
              {counts[tier.id]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center bg-white rounded-2xl p-8 border border-slate-200">
          <p className="text-slate-500">
            {t.component.oteller.hotels_grid.kategoride_otel_bulunamadi}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, index) => (
            <HotelCard key={item.slug} item={item} priority={index < 3} />
          ))}
        </div>
      )}
    </>
  );
}
