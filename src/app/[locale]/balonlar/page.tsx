import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import {
  breadcrumbSchema,
  faqPageSchema,
  itemListSchema,
} from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor, ogLocale } from "@/lib/hreflang";
import {
  DICTIONARIES,
  isLocale,
  DEFAULT_LOCALE,
  type Locale,
} from "@/lib/i18n/dictionaries";
import { tBalloons, tFaq } from "@/lib/i18n/localizeData";
import { BalonlarContent } from "./BalonlarContent";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.balonlar;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/balonlar", params.locale),
      languages: generateHreflang("/balonlar"),
    },
    openGraph: {
      locale: ogLocale(loc),
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: canonicalFor("/balonlar", params.locale),
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

export default function BalonlarPage({
  params,
}: {
  params: { locale: string };
}) {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const balonFaqs = tFaq(loc).filter((f) => f.category === "balon");

  return (
    <>
      <BalonlarContent />
      <JsonLd
        data={[
          breadcrumbSchema([{ name: DICTIONARIES[loc].nav.balloons, href: canonicalFor("/balonlar", loc) }]),
          itemListSchema(
            tBalloons(loc).map((pkg) => ({
              name: pkg.name,
              urlPath: canonicalFor(`/balonlar/${pkg.slug}`, loc),
            })),
            "Kapadokya Balon Turu Paketleri"
          ),
          faqPageSchema(balonFaqs.map((f) => ({ question: f.question, answer: f.answer }))),
        ]}
      />
    </>
  );
}
