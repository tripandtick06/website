import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, personSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { FOUNDER } from "@/data/founder";
import { HakkimizdaContent } from "./HakkimizdaContent";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.hakkimizda;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: `${SITE_URL}/hakkimizda`,
      languages: generateHreflang("/hakkimizda"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/hakkimizda`,
      type: "website",
      images: [
        {
          url: ogImageUrl(
            "Hakkımızda",
            "TÜRSAB Lisanslı · 12.000+ Müşteri · 9+ Operatör"
          ),
          width: 1200,
          height: 630,
          alt: d.meta_og_alt,
        },
      ],
    },
  };
}

export default function HakkimizdaPage() {
  return (
    <>
      <HakkimizdaContent />
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Hakkımızda", href: "/hakkimizda" }]),
          personSchema(FOUNDER),
        ]}
      />
    </>
  );
}
