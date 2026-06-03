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

export const runtime = "edge";

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
