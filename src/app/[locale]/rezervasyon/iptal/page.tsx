import type { Metadata } from "next";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { IptalContent } from "./IptalContent";

export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = serverDict(loc).page.rezervasyon.iptal;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    robots: { index: false, follow: false },
  };
}

export default function CancelPage({ searchParams }: { searchParams: { slug?: string } }) {
  const retrySlug = searchParams?.slug ?? "standart-balon-ucusu";
  return <IptalContent retrySlug={retrySlug} />;
}
