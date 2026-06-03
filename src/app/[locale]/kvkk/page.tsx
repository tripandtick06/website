import type { Metadata } from "next";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor } from "@/lib/hreflang";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { KvkkContent } from "./KvkkContent";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = serverDict(loc).page.kvkk;

  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/kvkk", params.locale),
      languages: generateHreflang("/kvkk"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/kvkk`,
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
      <KvkkContent />
      <JsonLd data={breadcrumbSchema([{ name: "KVKK", href: "/kvkk" }])} />
    </>
  );
}
