// /yorum — Musteri yorum yazma sayfasi.
//
// Importers: Footer FOOTER_COMPANY + ReviewsSection CTA + Step6 onay (yonlendirme)
// Affected: yeni musteri yorum giris formu (UI shell + YorumContent + ClientForm).
// Data: ClientForm POST /api/yorum (createReview)
// User verbatim: "kalan isleri tamamla"

import type { Metadata } from "next";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { YorumContent } from "./YorumContent";
import { routing } from "@/i18n/routing";

// Static prerender (2026-09-16): this page reads only dictionaries/catalog —
// no headers()/cookies()/searchParams — so it is built once per locale and
// served as a static asset by Cloudflare Pages instead of edge-rendered per
// request (Lighthouse: ~0.9 s TTFB on every listing page). Live prices stay
// client-side. Guard: tests/lib/static-listing-pages.test.ts
export const dynamic = "force-static";
// next-on-pages: without dynamicParams=false the route is SSG-with-fallback
// and the Cloudflare build refuses it ("not configured to run with the Edge
// Runtime"). Locales come from the layout's generateStaticParams.
export const dynamicParams = false;
// Own generateStaticParams (not only the layout's): next-on-pages only treats
// a route as prerendered when the page itself enumerates its params — the
// detail pages already do this; without it the Cloudflare build fails with
// "not configured to run with the Edge Runtime".
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = serverDict(loc).page.yorum;

  return {
    title: d.meta_title,
    description: d.meta_desc,
  };
}

export default function Page() {
  return <YorumContent />;
}
