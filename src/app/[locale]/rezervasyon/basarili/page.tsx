import type { Metadata } from "next";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { BasariliClient } from "./BasariliClient";

export const runtime = "edge";

// Server-component meta + client-component CTA buttons (PDF/iCal/Hesabim).
// User verbatim: "en uzunundan basla, en son benim mudahelem gereken seyleri yap"

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = serverDict(loc).page.rezervasyon.basarili;
  return {
    title: d.meta_title,
    description: d.meta_desc,
    robots: { index: false, follow: false },
  };
}

export default function SuccessPage({
  searchParams,
}: {
  searchParams: {
    session_id?: string;
    demo?: string;
    slug?: string;
    total?: string;
    currency?: string;
    bookingId?: string;
  };
}) {
  const isDemo = searchParams?.demo === "1";
  return (
    <BasariliClient
      isDemo={isDemo}
      sessionId={searchParams?.session_id}
      slug={searchParams?.slug}
      total={searchParams?.total}
      currency={searchParams?.currency}
      bookingIdFromUrl={searchParams?.bookingId}
    />
  );
}
