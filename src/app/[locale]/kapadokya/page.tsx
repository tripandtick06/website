import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor, ogLocale } from "@/lib/hreflang";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { KapadokyaContent } from "./KapadokyaContent";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = serverDict(loc).page.kapadokya;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/kapadokya", params.locale),
      languages: generateHreflang("/kapadokya"),
    },
    openGraph: {
      locale: ogLocale(loc),
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: canonicalFor("/kapadokya", params.locale),
      type: "website",
      images: [
        {
          url: ogImageUrl(
            "Kapadokya Rehberi 2026",
            "Balon · Otel · Tur · Aktivite · Fotoğraf Noktaları"
          ),
          width: 1200,
          height: 630,
          alt: d.meta_og_alt,
        },
      ],
    },
  };
}

export default function KapadokyaPage({
  params,
}: {
  params: { locale: string };
}) {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  return (
    <>
      <KapadokyaContent />
      <JsonLd data={breadcrumbSchema([{ name: "Kapadokya", href: canonicalFor("/kapadokya", loc) }])} />
    </>
  );
}
