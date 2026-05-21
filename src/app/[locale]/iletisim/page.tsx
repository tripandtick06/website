import type { Metadata } from "next";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";
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
      canonical: `${SITE_URL}/iletisim`,
      languages: generateHreflang("/iletisim"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/iletisim`,
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

export default function Page() {
  return (
    <>
      <IletisimContent />
      <JsonLd data={breadcrumbSchema([{ name: "İletişim", href: "/iletisim" }])} />
    </>
  );
}
