// Aktivite/tur/paket/transfer detay route factory — 4 kategori ayni mantigi paylasir.
// Her route page.tsx ilgili ServiceItem dizisi + kategori config'ini verir;
// generateStaticParams / generateMetadata / Page geri doner.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/layout/JsonLd";
import { ServiceDetailContent } from "@/components/layout/ServiceDetailContent";
import type { ServiceItem } from "@/data/services/catalog";
import { getLongDescription } from "@/data/services/descriptions";
import { isLocale, DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { tService } from "@/lib/i18n/localizeData";
import { breadcrumbSchema, productSchema } from "@/lib/schema";
import {
  generateHreflang,
  ogImageUrl,
  canonicalFor,
  ogLocale,
} from "@/lib/hreflang";
import { formatPrice } from "@/lib/utils";

type NavKey = "activities" | "tours" | "packages";

// "Hakkında" bolum basligi — 17 locale (yeni diller dict'te EN-alias oldugu icin
// kucuk inline map, dict plumbing'e gerek yok).
const ABOUT_LABEL: Record<Locale, string> = {
  tr: "Hakkında", en: "About", de: "Über", fr: "À propos de", es: "Acerca de",
  nl: "Over", zh: "关于", hi: "परिचय", ur: "تعارف", pt: "Sobre", "pt-BR": "Sobre",
  ja: "概要", ko: "소개", it: "Descrizione", ru: "Описание", uk: "Опис", az: "Haqqında",
};

export interface ServiceDetailConfig {
  items: ServiceItem[];
  /** TR-canonical listing path, orn "/aktiviteler". */
  categoryPath: string;
  /** serverDict().nav anahtari (etiket icin). nav'da olmayan kategori (transfer) navLabel kullanir. */
  navKey?: NavKey;
  /** navKey yoksa kategori etiketini locale'e gore dondurur (orn transfer). */
  navLabel?: (loc: Locale) => string;
}

type RouteParams = { params: { locale: string; slug: string } };

export function makeServiceDetailPage(cfg: ServiceDetailConfig) {
  const find = (slug: string): ServiceItem | undefined =>
    cfg.items.find((s) => s.slug === slug);

  function generateStaticParams() {
    // force-static + dynamicParams=false -> tum locale x slug onceden uretilir.
    return SUPPORTED_LOCALES.flatMap((locale) =>
      cfg.items.map((s) => ({ locale, slug: s.slug }))
    );
  }

  function generateMetadata({ params }: RouteParams): Metadata {
    const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const raw = find(params.slug);
    if (!raw) return { title: "Bulunamadı | Trip and Tick" };
    const item = tService(raw, loc);
    const path = `${cfg.categoryPath}/${item.slug}`;
    const geo = loc === "tr" ? "Kapadokya" : "Cappadocia";
    const priceLabel = item.priceOnRequest
      ? loc === "tr"
        ? "Özel Fiyat"
        : "Custom Price"
      : formatPrice(item.adultPrice, item.currency);
    const ogTitle = `${item.name} — ${geo} ${priceLabel}`;
    return {
      title: `${ogTitle} | Trip and Tick`,
      description: item.shortDescription,
      alternates: {
        canonical: canonicalFor(path, loc),
        languages: generateHreflang(path),
      },
      openGraph: {
        locale: ogLocale(loc),
        title: item.name,
        description: item.shortDescription,
        url: canonicalFor(path, loc),
        type: "website",
        images: [
          {
            url: ogImageUrl(ogTitle, item.shortDescription),
            width: 1200,
            height: 630,
            alt: item.name,
          },
        ],
      },
    };
  }

  function Page({ params }: RouteParams) {
    const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const raw = find(params.slug);
    if (!raw) notFound();
    const item = tService(raw, loc);
    const navLabel = cfg.navKey
      ? serverDict(loc).nav[cfg.navKey]
      : cfg.navLabel?.(loc) ?? "";
    const detailUrl = canonicalFor(`${cfg.categoryPath}/${item.slug}`, loc);
    const longDescription = getLongDescription(item.slug, loc);
    const aboutLabel = ABOUT_LABEL[loc] ?? "About";

    return (
      <>
        <ServiceDetailContent
          item={item}
          categoryLabel={navLabel}
          categoryHref={cfg.categoryPath}
          longDescription={longDescription}
          aboutLabel={aboutLabel}
        />
        <JsonLd
          data={[
            breadcrumbSchema([
              { name: navLabel, href: canonicalFor(cfg.categoryPath, loc) },
              { name: item.name, href: detailUrl },
            ]),
            productSchema({
              slug: item.slug,
              name: item.name,
              description: longDescription ?? item.shortDescription,
              image: item.photoUrl,
              price: item.adultPrice,
              currency: item.currency,
              rating: item.rating,
              reviewCount: item.reviewCount,
              category: navLabel,
              urlPath: detailUrl,
              priceOnRequest: item.priceOnRequest,
            }),
          ]}
        />
      </>
    );
  }

  return { generateStaticParams, generateMetadata, Page };
}
