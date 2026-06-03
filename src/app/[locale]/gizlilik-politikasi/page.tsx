import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor } from "@/lib/hreflang";
import {
  DICTIONARIES,
  isLocale,
  DEFAULT_LOCALE,
  type Locale,
} from "@/lib/i18n/dictionaries";
import { GizlilikContent } from "./GizlilikContent";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.gizlilik_politikasi;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/gizlilik-politikasi", params.locale),
      languages: generateHreflang("/gizlilik-politikasi"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/gizlilik-politikasi`,
      type: "website",
      images: [
        {
          url: ogImageUrl(d.meta_title_2, "KVKK & GDPR"),
          width: 1200,
          height: 630,
          alt: d.meta_og_alt,
        },
      ],
    },
  };
}

export default function GizlilikPage() {
  return (
    <>
      <GizlilikContent />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
        ])}
      />
    </>
  );
}
