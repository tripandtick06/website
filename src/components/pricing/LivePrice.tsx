"use client";

// LivePrice — SSR'da fallback (katalog) fiyati render eder, mount sonrasi
// /api/base-prices'tan canli taban fiyati (varsa) sessizce swap eder.
// Modul-seviyesi promise cache: sayfada N instance olsa da fetch 1 kere atilir.
// Fetch basarisiz olursa fallback kalir — flicker/layout-shift yok (ayni format fn).

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

interface BasePricesResponse {
  prices?: Record<string, number>;
}

let basePricesPromise: Promise<Record<string, number>> | null = null;

function loadBasePrices(): Promise<Record<string, number>> {
  if (!basePricesPromise) {
    basePricesPromise = fetch("/api/base-prices")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<BasePricesResponse>;
      })
      .then((data) => data.prices ?? {})
      .catch(() => ({}));
  }
  return basePricesPromise;
}

export interface LivePriceProps {
  /** Katalogdaki hizmet slug'i — /api/base-prices cevabindaki key ile eslesir. */
  slug: string;
  /** SSR/ilk render'da gosterilecek katalog fiyati. */
  fallback: number;
  className?: string;
  /** Ozel formatlayici (varsayilan: formatPrice(n, "EUR")). */
  format?: (n: number) => string;
}

export function LivePrice({ slug, fallback, className, format }: LivePriceProps) {
  const [price, setPrice] = useState<number>(fallback);

  useEffect(() => {
    let cancelled = false;
    loadBasePrices().then((prices) => {
      if (cancelled) return;
      const live = prices[slug];
      if (typeof live === "number" && Number.isFinite(live) && live > 0) {
        setPrice(live);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const fmt = format ?? ((n: number) => formatPrice(n));
  const text = fmt(price);

  return className ? <span className={className}>{text}</span> : <>{text}</>;
}
