// Server component — visible "last updated" line (GEO/E-E-A-T freshness signal).
// The same ISO date is emitted as dateModified in the page's WebPage JSON-LD
// (see src/lib/page-dates.ts + webPageSchema in src/lib/schema.ts).

const LABELS: Record<string, string> = {
  tr: "Son güncelleme",
  en: "Last updated",
  de: "Zuletzt aktualisiert",
  fr: "Dernière mise à jour",
  nl: "Bijgewerkt op",
  es: "Última actualización",
  "pt-BR": "Última atualização",
  ja: "最終更新日",
  ko: "최종 업데이트",
};

export function formatUpdated(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function updatedLabel(locale: string): string {
  return LABELS[locale] ?? LABELS.en;
}

export function LastUpdated({ iso, locale }: { iso: string; locale: string }) {
  return (
    <p className="container-main py-4 text-center text-sm text-slate-500">
      {updatedLabel(locale)}: <time dateTime={iso}>{formatUpdated(iso, locale)}</time>
    </p>
  );
}
