import type { Metadata } from "next";
import { SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor } from "@/lib/hreflang";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { ImpressumContent } from "./ImpressumContent";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = serverDict(loc).page.impressum;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: canonicalFor("/impressum", params.locale),
      languages: generateHreflang("/impressum"),
    },
    openGraph: {
      title: d.meta_title,
      description: d.meta_og_desc,
      url: `${SITE_URL}/impressum`,
      type: "website",
      images: [
        {
          url: ogImageUrl("Impressum", "§ 5 TMG · § 18 MStV"),
          width: 1200,
          height: 630,
          alt: d.meta_title,
        },
      ],
    },
    robots: { index: true, follow: true },
  };
}

export default function ImpressumPage() {
  return <ImpressumContent />;
}
