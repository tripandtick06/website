import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor, ogLocale } from "@/lib/hreflang";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { tFaq } from "@/lib/i18n/localizeData";
import { SssContent } from "./SssContent";
import { routing } from "@/i18n/routing";

// Static prerender (2026-09-16): this page reads only dictionaries/catalog —
// no headers()/cookies()/searchParams — so it is built once per locale and
// served as a static asset by Cloudflare Pages instead of edge-rendered per
// request (Lighthouse: ~0.9 s TTFB on every listing page). Live prices stay
// client-side. Guard: tests/lib/static-listing-pages.test.ts
export const dynamic = "force-static";
// next-on-pages: without dynamicParams=false the route is SSG-with-fallback
// and the Cloudflare build refuses it ("not configured to run with the Edge
// Runtime"). Locales come from the layout's generateStaticParams.
export const dynamicParams = false;
// Own generateStaticParams (not only the layout's): next-on-pages only treats
// a route as prerendered when the page itself enumerates its params — the
// detail pages already do this; without it the Cloudflare build fails with
// "not configured to run with the Edge Runtime".
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = serverDict(loc).page.sss;

  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/sss", params.locale),
      languages: generateHreflang("/sss"),
    },
    openGraph: {
      locale: ogLocale(loc),
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: canonicalFor("/sss", params.locale),
      type: "website",
      images: [
        {
          url: ogImageUrl(
            d.meta_title_2,
            (d as Record<string, string>).meta_og_image_subtitle ?? "Balon Turu · Fiyat · İptal · Ödeme — Hızlı Cevaplar"
          ),
          width: 1200,
          height: 630,
          alt: d.meta_og_alt,
        },
      ],
    },
  };
}

export default function Page({ params }: { params: { locale: string } }) {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const faqItems = tFaq(loc);
  return (
    <>
      <SssContent />
      <JsonLd
        data={[
          breadcrumbSchema([{ name: serverDict(loc).nav.faq, href: canonicalFor("/sss", loc) }]),
          faqPageSchema(
            faqItems.map((f) => ({ question: f.question, answer: f.answer }))
          ),
        ]}
      />
    </>
  );
}
