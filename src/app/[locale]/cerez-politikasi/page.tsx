import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor } from "@/lib/hreflang";
import {
  isLocale,
  DEFAULT_LOCALE,
  type Locale,
} from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { CerezContent } from "./CerezContent";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = serverDict(loc).page.cerez_politikasi;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/cerez-politikasi", params.locale),
      languages: generateHreflang("/cerez-politikasi"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/cerez-politikasi`,
      type: "website",
      images: [
        {
          url: ogImageUrl(d.meta_title_2, "Zorunlu · Analitik · Pazarlama"),
          width: 1200,
          height: 630,
          alt: d.meta_title,
        },
      ],
    },
  };
}

export default function CerezPage() {
  return (
    <>
      <CerezContent />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Çerez Politikası", href: "/cerez-politikasi" },
        ])}
      />
    </>
  );
}
