// Veri katmani i18n overlay — TR base data + per-locale ceviri JSON merge.
// Kaynak: src/data/i18n/_source.tr.json'dan uretilmis data.<locale>.json (ceviri ajanlari).
// Kullanim: const packages = tBalloons(locale); <HotelsGrid hotels={tServiceList(HOTELS, locale)} />
// tr (veya eksik locale) -> base TR data dondurur (fallback).

import type { Locale } from "./dictionaries";
import { BALLOON_PACKAGES, type BalloonPackage } from "@/data/services/balloons";
import type { ServiceItem } from "@/data/services/catalog";
import { FAQ_ITEMS, type FAQItem } from "@/data/faq";
import type { Review } from "@/data/reviews";

import en from "@/data/i18n/data.en.json";
import de from "@/data/i18n/data.de.json";
import fr from "@/data/i18n/data.fr.json";
import es from "@/data/i18n/data.es.json";
import nl from "@/data/i18n/data.nl.json";
import zh from "@/data/i18n/data.zh.json";
import hi from "@/data/i18n/data.hi.json";
import ur from "@/data/i18n/data.ur.json";

type FieldMap = Record<string, string | string[]>;
interface Bundle {
  balloons: Record<string, FieldMap>;
  services: Record<string, FieldMap>;
  faq: Record<string, FieldMap>;
  reviews: Record<string, FieldMap>;
}

const BUNDLES: Partial<Record<Locale, Bundle>> = {
  en: en as unknown as Bundle,
  de: de as unknown as Bundle,
  fr: fr as unknown as Bundle,
  es: es as unknown as Bundle,
  nl: nl as unknown as Bundle,
  zh: zh as unknown as Bundle,
  hi: hi as unknown as Bundle,
  ur: ur as unknown as Bundle,
};

/** Balon paketleri — locale'e gore cevrili alanlarla. */
export function tBalloons(locale: Locale): BalloonPackage[] {
  const b = BUNDLES[locale]?.balloons;
  if (!b) return BALLOON_PACKAGES;
  return BALLOON_PACKAGES.map((p) => {
    const o = b[p.slug];
    return o ? { ...p, ...(o as Partial<BalloonPackage>) } : p;
  });
}

/** Tek balon paketi (detay sayfasi). */
export function tBalloon(pkg: BalloonPackage, locale: Locale): BalloonPackage {
  const o = BUNDLES[locale]?.balloons?.[pkg.slug];
  return o ? { ...pkg, ...(o as Partial<BalloonPackage>) } : pkg;
}

/** ServiceItem listesi (otel/tur/aktivite/paket/transfer) — cevrili alanlarla. */
export function tServiceList(list: ServiceItem[], locale: Locale): ServiceItem[] {
  const s = BUNDLES[locale]?.services;
  if (!s) return list;
  return list.map((it) => {
    const o = s[it.slug];
    return o ? { ...it, ...(o as Partial<ServiceItem>) } : it;
  });
}

/** Tek ServiceItem (detay sayfasi / findService sonucu). */
export function tService<T extends ServiceItem | undefined>(item: T, locale: Locale): T {
  if (!item) return item;
  const o = BUNDLES[locale]?.services?.[item.slug];
  return (o ? { ...item, ...(o as Partial<ServiceItem>) } : item) as T;
}

/** FAQ — cevrili soru/cevap. Sira/kategori korunur. */
export function tFaq(locale: Locale): FAQItem[] {
  const f = BUNDLES[locale]?.faq;
  if (!f) return FAQ_ITEMS;
  return FAQ_ITEMS.map((item, i) => {
    const o = f[`f${i}`];
    return o ? { ...item, ...(o as Partial<FAQItem>) } : item;
  });
}

/** Yorumlar — cevrili text/service (isim/ulke/tarih korunur). */
export function tReviews(list: Review[], locale: Locale): Review[] {
  const r = BUNDLES[locale]?.reviews;
  if (!r) return list;
  return list.map((it) => {
    const o = r[it.id];
    return o ? { ...it, ...(o as Partial<Review>) } : it;
  });
}
