import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor } from "@/lib/hreflang";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { tFaq } from "@/lib/i18n/localizeData";
import { SssContent } from "./SssContent";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.sss;

  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/sss", params.locale),
      languages: generateHreflang("/sss"),
    },
    openGraph: {
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
          breadcrumbSchema([{ name: DICTIONARIES[loc].nav.faq, href: canonicalFor("/sss", loc) }]),
          faqPageSchema(
            faqItems.map((f) => ({ question: f.question, answer: f.answer }))
          ),
        ]}
      />
    </>
  );
}
