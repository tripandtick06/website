import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, itemListSchema, faqPageSchema } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor, ogLocale } from "@/lib/hreflang";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { PACKAGES } from "@/data/services/catalog";
import { tServiceList } from "@/lib/i18n/localizeData";
import { getPageFaqs } from "@/data/i18n/pageFaqs";
import { PaketlerContent } from "./PaketlerContent";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.paketler;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/paketler", params.locale),
      languages: generateHreflang("/paketler"),
    },
    openGraph: {
      locale: ogLocale(loc),
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: canonicalFor("/paketler", params.locale),
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

export default function PaketlerPage({
  params,
}: {
  params: { locale: string };
}) {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const itemList = itemListSchema(
    tServiceList(PACKAGES, loc).map((p) => ({ name: p.name, urlPath: canonicalFor(`/rezervasyon/${p.slug}`, loc) })),
    "Kapadokya Kombi Paketleri"
  );

  return (
    <>
      <PaketlerContent />
      <JsonLd data={breadcrumbSchema([{ name: DICTIONARIES[loc].nav.packages, href: canonicalFor("/paketler", loc) }])} />
      <JsonLd data={itemList} />
      <JsonLd data={faqPageSchema(getPageFaqs("packages", loc))} />
    </>
  );
}
