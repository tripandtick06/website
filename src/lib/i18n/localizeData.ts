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
import pt from "@/data/i18n/data.pt.json";
import ptBR from "@/data/i18n/data.pt-BR.json";
import ja from "@/data/i18n/data.ja.json";
import ko from "@/data/i18n/data.ko.json";
import it from "@/data/i18n/data.it.json";
import ru from "@/data/i18n/data.ru.json";
import uk from "@/data/i18n/data.uk.json";
import az from "@/data/i18n/data.az.json";

type FieldMap = Record<string, string | string[]>;
interface Bundle {
  balloons: Record<string, FieldMap>;
  services: Record<string, FieldMap>;
  faq: Record<string, FieldMap>;
  reviews: Record<string, FieldMap>;
}

// Duration alanini locale'e gore yerellestir (dk/saat/gun/gece -> dil birimleri).
// Data'da "60 dk", "2 saat", "2 gun 1 gece", "Saatlik" gibi TR degerler var.
const DUR: Partial<Record<Locale, { dk: string; saat: string; gun: string; gece: string; saatlik: string; tamgun: string }>> = {
  en: { dk: "min", saat: "h", gun: "day", gece: "night", saatlik: "Hourly", tamgun: "Full day" },
  de: { dk: "Min", saat: "Std", gun: "Tag", gece: "Nacht", saatlik: "Stündlich", tamgun: "Ganztags" },
  fr: { dk: "min", saat: "h", gun: "jour", gece: "nuit", saatlik: "À l'heure", tamgun: "Journée" },
  es: { dk: "min", saat: "h", gun: "día", gece: "noche", saatlik: "Por hora", tamgun: "Día completo" },
  nl: { dk: "min", saat: "uur", gun: "dag", gece: "nacht", saatlik: "Per uur", tamgun: "Hele dag" },
  zh: { dk: "分钟", saat: "小时", gun: "天", gece: "晚", saatlik: "按小时", tamgun: "全天" },
  hi: { dk: "मिनट", saat: "घंटे", gun: "दिन", gece: "रात", saatlik: "प्रति घंटा", tamgun: "पूरा दिन" },
  ur: { dk: "منٹ", saat: "گھنٹے", gun: "دن", gece: "رات", saatlik: "فی گھنٹہ", tamgun: "پورا دن" },
};

export function localizeDuration(dur: string, locale: Locale): string {
  if (locale === "tr" || !dur) return dur;
  const u = DUR[locale];
  if (!u) return dur;
  return dur
    .replace(/Saatlik/gi, u.saatlik)
    .replace(/Tam [Gg]ün/g, u.tamgun)
    .replace(/\bgün\b/gi, u.gun)
    .replace(/\bgece\b/gi, u.gece)
    .replace(/\bsaat\b/gi, u.saat)
    .replace(/\bdk\b/gi, u.dk);
}

function withDuration<T extends { duration?: string }>(item: T, locale: Locale): T {
  return item.duration ? { ...item, duration: localizeDuration(item.duration, locale) } : item;
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
  pt: pt as unknown as Bundle,
  "pt-BR": ptBR as unknown as Bundle,
  ja: ja as unknown as Bundle,
  ko: ko as unknown as Bundle,
  it: it as unknown as Bundle,
  ru: ru as unknown as Bundle,
  uk: uk as unknown as Bundle,
  az: az as unknown as Bundle,
};

/** Balon paketleri — locale'e gore cevrili alanlarla. */
export function tBalloons(locale: Locale): BalloonPackage[] {
  const b = BUNDLES[locale]?.balloons;
  if (!b) return BALLOON_PACKAGES;
  return BALLOON_PACKAGES.map((p) => {
    const o = b[p.slug];
    return withDuration(o ? { ...p, ...(o as Partial<BalloonPackage>) } : p, locale);
  });
}

/** Tek balon paketi (detay sayfasi). */
export function tBalloon(pkg: BalloonPackage, locale: Locale): BalloonPackage {
  const o = BUNDLES[locale]?.balloons?.[pkg.slug];
  return withDuration(o ? { ...pkg, ...(o as Partial<BalloonPackage>) } : pkg, locale);
}

/** ServiceItem listesi (otel/tur/aktivite/paket/transfer) — cevrili alanlarla. */
export function tServiceList(list: ServiceItem[], locale: Locale): ServiceItem[] {
  const s = BUNDLES[locale]?.services;
  if (!s) return list;
  return list.map((it) => {
    const o = s[it.slug];
    return withDuration(o ? { ...it, ...(o as Partial<ServiceItem>) } : it, locale);
  });
}

/** Tek ServiceItem (detay sayfasi / findService sonucu). */
export function tService<T extends ServiceItem | undefined>(item: T, locale: Locale): T {
  if (!item) return item;
  const base: ServiceItem = item;
  const o = BUNDLES[locale]?.services?.[base.slug];
  return withDuration(o ? { ...base, ...(o as Partial<ServiceItem>) } : base, locale) as T;
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
