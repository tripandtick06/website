import type { Metadata } from "next";
import { SITE_URL } from "@/lib/schema";
import { generateHreflang } from "@/lib/hreflang";
import { DICTIONARIES, isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { GdprContent } from "./GdprContent";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = DICTIONARIES[loc].page.gdpr;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    alternates: {
      canonical: `${SITE_URL}/gdpr`,
      languages: generateHreflang("/gdpr"),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function GdprPage() {
  return <GdprContent />;
}
