// Server component — content-page trust block: visible Organization byline
// (class "author"), visible last-updated date and WebPage JSON-LD whose
// description equals the page's meta description and whose dateModified is the
// page's real last-change date (src/lib/page-dates.ts). No invented people:
// the author is always the Trip and Tick editorial team (Organization).

import { JsonLd } from "@/components/layout/JsonLd";
import { LastUpdated } from "@/components/layout/LastUpdated";
import { PAGE_UPDATED, type UpdatedPath } from "@/lib/page-dates";
import { canonicalFor } from "@/lib/hreflang";
import { webPageSchema } from "@/lib/schema";
import { serverDict } from "@/lib/i18n/serverDict";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n/dictionaries";

const BYLINE: Record<string, string> = {
  tr: "Hazırlayan: Trip and Tick editörlüğü",
  en: "By the Trip and Tick editorial team",
  de: "Von der Trip and Tick Redaktion",
  fr: "Par la rédaction Trip and Tick",
  nl: "Door de redactie van Trip and Tick",
  es: "Por el equipo editorial de Trip and Tick",
  "pt-BR": "Por Trip and Tick editorial",
  ja: "Trip and Tick 編集部",
  ko: "Trip and Tick 편집팀",
};

export function bylineLabel(locale: string): string {
  return BYLINE[locale] ?? BYLINE.en;
}

export function Byline({ locale }: { locale: string }) {
  return (
    <p className="container-main pt-4 text-center text-sm text-slate-500">
      <span className="author">{bylineLabel(locale)}</span>
    </p>
  );
}

interface PageMetaProps {
  /** serverDict().page anahtari (meta_title / meta_desc kaynagi). */
  dictKey: string;
  path: UpdatedPath;
  locale: string;
}

export function PageMeta({ dictKey, path, locale }: PageMetaProps) {
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const d = (serverDict(loc).page as unknown as Record<string, { meta_title: string; meta_desc: string }>)[dictKey];
  const iso = PAGE_UPDATED[path];
  return (
    <>
      <JsonLd
        data={webPageSchema({
          url: canonicalFor(path, loc),
          name: d.meta_title,
          description: d.meta_desc,
          locale: loc,
          dateModified: iso,
          withAuthor: true,
        })}
      />
      <Byline locale={loc} />
      <LastUpdated iso={iso} locale={loc} />
    </>
  );
}
