import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, personSchema } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor, ogLocale } from "@/lib/hreflang";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { FOUNDER } from "@/data/founder";
import { HakkimizdaContent } from "./HakkimizdaContent";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = serverDict(loc).page.hakkimizda;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/hakkimizda", params.locale),
      languages: generateHreflang("/hakkimizda"),
    },
    openGraph: {
      locale: ogLocale(loc),
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: canonicalFor("/hakkimizda", params.locale),
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

export default function HakkimizdaPage({
  params,
}: {
  params: { locale: string };
}) {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  return (
    <>
      <HakkimizdaContent />
      <JsonLd
        data={[
          breadcrumbSchema([{ name: serverDict(loc).nav.about, href: canonicalFor("/hakkimizda", loc) }]),
          personSchema(FOUNDER),
        ]}
      />
    </>
  );
}
