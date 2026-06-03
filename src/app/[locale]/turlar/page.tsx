import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, itemListSchema, faqPageSchema } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor } from "@/lib/hreflang";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { TOURS } from "@/data/services/catalog";
import { getPageFaqs } from "@/data/i18n/pageFaqs";
import { TurlarContent } from "./TurlarContent";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.turlar;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/turlar", params.locale),
      languages: generateHreflang("/turlar"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: canonicalFor("/turlar", params.locale),
      type: "website",
      images: [
        {
          url: ogImageUrl(
            d.meta_title_2,
            d.og_image_subtitle
          ),
          width: 1200,
          height: 630,
          alt: d.meta_og_alt,
        },
      ],
    },
  };
}

export default function TurlarPage({
  params,
}: {
  params: { locale: string };
}) {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const itemList = itemListSchema(
    TOURS.map((t) => ({ name: t.name, urlPath: canonicalFor(`/rezervasyon/${t.slug}`, loc) })),
    "Kapadokya Gezi Turları"
  );

  return (
    <>
      <TurlarContent />
      <JsonLd data={breadcrumbSchema([{ name: DICTIONARIES[loc].nav.tours, href: canonicalFor("/turlar", loc) }])} />
      <JsonLd data={itemList} />
      <JsonLd data={faqPageSchema(getPageFaqs("tours", loc))} />
    </>
  );
}
