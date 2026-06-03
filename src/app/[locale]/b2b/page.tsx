// B2B acente landing — basvuru formu + giris linki + avantajlar.
//
// Importers: Next.js App Router auto-route /b2b. Linkler:
//   - Footer.tsx "B2B Acente" → /b2b
//   - /b2b/login (mevcut acenteler)
// Affected: yeni public landing sayfasi B2B kanali tanitir.
// Data: form POST → /api/b2b/apply (Brevo mail).
// User verbatim: "B2B landing: PageHero, Avantajlar (toplu fiyat, API, destek,
// %15+ komisyon), Basvur form (email + sirket + telefon + ulke + lisans),
// B2B Giris link /b2b/login."

import type { Metadata } from "next";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor } from "@/lib/hreflang";
import { B2BContent } from "./B2BContent";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.b2b;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/b2b", params.locale),
      languages: generateHreflang("/b2b"),
    },
    openGraph: {
      title: d.meta_title_2,
      description: d.meta_desc_2,
      url: `${SITE_URL}/b2b`,
      type: "website",
      images: [
        {
          url: ogImageUrl(
            "B2B Acente Programı",
            "Toplu Fiyat · API Erişimi · %12-18 Komisyon"
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
      <B2BContent />
      <JsonLd data={breadcrumbSchema([{ name: "B2B", href: "/b2b" }])} />
    </>
  );
}
