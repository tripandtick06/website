import type { Metadata } from "next";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { generateHreflang, ogImageUrl, canonicalFor, ogLocale } from "@/lib/hreflang";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { HOTELS } from "@/data/services/catalog";
import { tServiceList } from "@/lib/i18n/localizeData";
import { OtellerContent } from "./OtellerContent";

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

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = serverDict(loc).page.oteller;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/oteller", params.locale),
      languages: generateHreflang("/oteller"),
    },
    openGraph: {
      locale: ogLocale(loc),
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: canonicalFor("/oteller", params.locale),
      type: "website",
      images: [
        {
          url: ogImageUrl(d.meta_title_2, d.meta_desc_2),
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
  return (
    <>
      <OtellerContent />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: serverDict(loc).nav.hotels, href: canonicalFor("/oteller", loc) },
          ]),
          itemListSchema(
            tServiceList(HOTELS, loc).map((h) => ({
              name: h.name,
              urlPath: canonicalFor(`/oteller/${h.slug}`, loc),
            })),
            "Kapadokya Otelleri"
          ),
        ]}
      />
    </>
  );
}
