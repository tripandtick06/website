import type { Metadata } from "next";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor } from "@/lib/hreflang";
import { IletisimContent } from "./IletisimContent";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.iletisim;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/iletisim", params.locale),
      languages: generateHreflang("/iletisim"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: canonicalFor("/iletisim", params.locale),
      type: "website",
      images: [
        {
          url: ogImageUrl(
            "İletişim",
            "WhatsApp 7/24 · E-posta 4 saat · Göreme Ofis"
          ),
          width: 1200,
          height: 630,
          alt: d.meta_title_2,
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
  return (
    <>
      <IletisimContent />
      <JsonLd data={breadcrumbSchema([{ name: DICTIONARIES[loc].nav.contact, href: canonicalFor("/iletisim", loc) }])} />
    </>
  );
}
