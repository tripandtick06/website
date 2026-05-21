import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { KullanimSartlariContent } from "./KullanimSartlariContent";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.kullanim_sartlari;

  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: `${SITE_URL}/kullanim-sartlari`,
      languages: generateHreflang("/kullanim-sartlari"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/kullanim-sartlari`,
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

export default function Page() {
  return (
    <>
      <KullanimSartlariContent />
      <JsonLd data={breadcrumbSchema([{ name: "Kullanım Şartları", href: "/kullanim-sartlari" }])} />
    </>
  );
}
