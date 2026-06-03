import type { Metadata } from "next";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { SITE_URL, itemListSchema, faqPageSchema } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";
import { JsonLd } from "@/components/layout/JsonLd";
import { TRANSFERS } from "@/data/services/catalog";
import { tServiceList } from "@/lib/i18n/localizeData";
import { getPageFaqs } from "@/data/i18n/pageFaqs";
import { TransferlerContent } from "./TransferlerContent";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.transferler;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: `${SITE_URL}/transferler`,
      languages: generateHreflang("/transferler"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/transferler`,
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

export default function Page({
  params,
}: {
  params: { locale: string };
}) {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const itemList = itemListSchema(
    tServiceList(TRANSFERS, loc).map((t) => ({ name: t.name, urlPath: `/rezervasyon/${t.slug}` })),
    "Kapadokya Havalimanı Transferleri"
  );

  return (
    <>
      <TransferlerContent />
      <JsonLd data={itemList} />
      <JsonLd data={faqPageSchema(getPageFaqs("transfers", loc))} />
    </>
  );
}
