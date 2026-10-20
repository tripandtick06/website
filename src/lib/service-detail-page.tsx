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
import { clampTitle } from "@/lib/title";
import { tService } from "@/lib/i18n/localizeData";
import { breadcrumbSchema, faqPageSchema, productSchema, videoObjectSchema, webPageSchema } from "@/lib/schema";
import { ACTIVITY_SEO, ACTIVITY_SEO_UPDATED, getActivitySeo } from "@/data/activitySeo";
import { ACTIVITIES } from "@/data/services/catalog";
import { Byline } from "@/components/layout/PageMeta";
import { LastUpdated } from "@/components/layout/LastUpdated";
import {
  generateHreflang,
  ogImageUrl,
  canonicalFor,
  ogLocale,
} from "@/lib/hreflang";
import { fromPriceShort } from "@/lib/price-label";
import { getServiceVideo } from "@/data/services/videos";

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

/** Katalog detay sayfalari icin gercek son degisiklik (catalog.ts sitemap lastmod). */
const CATALOG_UPDATED = "2026-06-03";

/** public/videos/* ilk commit tarihi (git) — VideoObject.uploadDate. */
const VIDEO_UPLOADED = "2026-09-16";

const SEO_UI = {
  tr: { faq: "Sık Sorulan Sorular", related: "Benzer deneyimler", balloon: "Kapadokya balon turu fiyatları" },
  en: { faq: "Frequently Asked Questions", related: "Related experiences", balloon: "Cappadocia balloon tour prices" },
} as const;

function fill(text: string, from: string): string {
  return text.replace(/\{from\}/g, from);
}

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
    if (!raw) return { title: "Bulunamadı" };
    const item = tService(raw, loc);
    const path = `${cfg.categoryPath}/${item.slug}`;
    const geo = loc === "tr" ? "Kapadokya" : "Cappadocia";
    const priceLabel = item.priceOnRequest
      ? loc === "tr"
        ? "Özel Fiyat"
        : "Custom Price"
      : fromPriceShort(loc, item.adultPrice, item.currency);
    // Do not repeat the region when the item name already carries it
    // ("Kapadokya Kırmızı Tur — Kapadokya €45" read as keyword stuffing and
    // pushed titles past 60 chars; final audit 2026-09-16).
    const hasGeo = /kapadokya|cappadocia|kappadokien|cappadoce|capadocia|capadócia|カッパドキア|카파도키아/i.test(item.name);
    const seo = cfg.categoryPath === "/aktiviteler" ? getActivitySeo(item.slug, loc) : undefined;
    const ogTitle = seo
      ? fill(seo.title, priceLabel)
      : hasGeo
        ? `${item.name} — ${priceLabel}`
        : `${item.name} — ${geo} ${priceLabel}`;
    const metaDescription = seo ? fill(seo.description, priceLabel) : item.shortDescription;
    return {
      // root layout title.template appends the brand — a hardcoded suffix here
      // rendered "… | Trip and Tick | Trip and Tick" on every activity/tour/
      // transfer page (live audit 2026-09-16).
      title: clampTitle(ogTitle),
      description: metaDescription,
      alternates: {
        canonical: canonicalFor(path, loc),
        languages: generateHreflang(path),
      },
      openGraph: {
        locale: ogLocale(loc),
        title: item.name,
        description: metaDescription,
        url: canonicalFor(path, loc),
        type: "website",
        images: [
          {
            url: ogImageUrl(ogTitle, metaDescription),
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
    const seo = cfg.categoryPath === "/aktiviteler" ? getActivitySeo(item.slug, loc) : undefined;
    const priceLabel = item.priceOnRequest
      ? loc === "tr"
        ? "Özel Fiyat"
        : "Custom Price"
      : fromPriceShort(loc, item.adultPrice, item.currency);
    const ui = loc === "tr" ? SEO_UI.tr : SEO_UI.en;
    const faqs = seo?.faqs.map((f) => ({ q: fill(f.q, priceLabel), a: fill(f.a, priceLabel) }));
    const related = seo
      ? ACTIVITY_SEO[item.slug].related.flatMap((r) => {
          if (r.startsWith("/")) return [{ href: r, label: ui.balloon }];
          const target = ACTIVITIES.find((a) => a.slug === r);
          return target
            ? [{ href: `${cfg.categoryPath}/${r}`, label: tService(target, loc).name }]
            : [];
        })
      : undefined;
    const metaDescription = seo ? fill(seo.description, priceLabel) : item.shortDescription;
    const video = getServiceVideo(item.slug);

    return (
      <>
        <ServiceDetailContent
          item={item}
          categoryLabel={navLabel}
          categoryHref={cfg.categoryPath}
          longDescription={longDescription}
          aboutLabel={aboutLabel}
          answer={seo ? fill(seo.answer, priceLabel) : undefined}
          faqs={faqs}
          faqHeading={ui.faq}
          related={related}
          relatedHeading={ui.related}
        />
        <Byline locale={loc} />
        <LastUpdated iso={seo ? ACTIVITY_SEO_UPDATED : CATALOG_UPDATED} locale={loc} />
        <JsonLd
          data={[
            webPageSchema({
              url: detailUrl,
              name: item.name,
              description: metaDescription,
              locale: loc,
              dateModified: seo ? ACTIVITY_SEO_UPDATED : CATALOG_UPDATED,
              withAuthor: true,
            }),
            ...(video
              ? [
                  videoObjectSchema({
                    name: item.name,
                    description: metaDescription,
                    src: video.src,
                    poster: video.poster,
                    uploadDate: VIDEO_UPLOADED,
                    pageUrl: detailUrl,
                  }),
                ]
              : []),
            ...(faqs
              ? [faqPageSchema(faqs.map((f) => ({ question: f.q, answer: f.a })))]
              : []),
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
