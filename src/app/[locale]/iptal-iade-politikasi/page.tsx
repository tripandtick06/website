import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor } from "@/lib/hreflang";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { IptalIadeContent } from "./IptalIadeContent";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = serverDict(loc).page.iptal_iade_politikasi;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/iptal-iade-politikasi", params.locale),
      languages: generateHreflang("/iptal-iade-politikasi"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/iptal-iade-politikasi`,
      type: "website",
      images: [
        {
          url: ogImageUrl(
            "İptal & İade Politikası",
            "%100 İade Garantisi · 72 Saat Kuralı"
          ),
          width: 1200,
          height: 630,
          alt: d.meta_og_alt,
        },
      ],
    },
  };
}

export default function IptalIadePage() {
  return (
    <>
      <IptalIadeContent />
      <JsonLd data={breadcrumbSchema([{ name: "İptal & İade", href: "/iptal-iade-politikasi" }])} />
    </>
  );
}
