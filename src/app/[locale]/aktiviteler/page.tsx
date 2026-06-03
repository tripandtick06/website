import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, itemListSchema, faqPageSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { ACTIVITIES } from "@/data/services/catalog";
import { tServiceList } from "@/lib/i18n/localizeData";
import { getPageFaqs } from "@/data/i18n/pageFaqs";
import { AktivitelerContent } from "./AktivitelerContent";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.aktiviteler;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: `${SITE_URL}/aktiviteler`,
      languages: generateHreflang("/aktiviteler"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/aktiviteler`,
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

export default function AktivitelerPage({
  params,
}: {
  params: { locale: string };
}) {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const itemList = itemListSchema(
    tServiceList(ACTIVITIES, loc).map((a) => ({ name: a.name, urlPath: `/rezervasyon/${a.slug}` })),
    "Kapadokya Aktiviteleri"
  );

  return (
    <>
      <AktivitelerContent />
      <JsonLd data={breadcrumbSchema([{ name: "Aktiviteler", href: "/aktiviteler" }])} />
      <JsonLd data={itemList} />
      <JsonLd data={faqPageSchema(getPageFaqs("activities", loc))} />
    </>
  );
}
