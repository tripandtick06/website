// /balonlar/bugun-ucuyor-mu — "Are the balloons flying today?"
//
// Why this page exists (2026-09-16): Google Autocomplete in every indexable
// locale carries the same intent — "cappadocia hot air balloon status /
// forecast", "kapadokya balon ne zaman uçmaz", "カッパドキア 気球 今日",
// "카파도키아 열기구 가능 여부". Nobody serves it in 7 languages.
//
// Data: Open-Meteo forecast for Göreme at the sunrise hour (src/lib/
// flight-forecast.ts), classified with conservative public rule-of-thumb
// limits. The page states on every render that the official go/no-go is
// issued each morning by the civil aviation authority. No cancellation
// statistics are shown because none exist publicly.
//
// Rendering: edge runtime (per request), forecast fetch revalidated every
// 30 min; the static explainer/FAQ renders even when the fetch fails.

import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/layout/JsonLd";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { generateHreflang, ogImageUrl, canonicalFor, ogLocale } from "@/lib/hreflang";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";
import { serverDict } from "@/lib/i18n/serverDict";
import { robotsForLocale } from "@/lib/locale-index";
import { flyingTodayCopy } from "@/data/i18n/flyingToday";
import { fetchFlightForecast, type Outlook, type SunriseSlot } from "@/lib/flight-forecast";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const PATH = "/balonlar/bugun-ucuyor-mu";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const c = flyingTodayCopy(loc);
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    robots: robotsForLocale(loc),
    alternates: {
      canonical: canonicalFor(PATH, loc),
      languages: generateHreflang(PATH),
    },
    openGraph: {
      locale: ogLocale(loc),
      title: c.h1,
      description: c.metaDescription,
      url: canonicalFor(PATH, loc),
      type: "website",
      images: [{ url: ogImageUrl(c.h1, c.metaDescription.slice(0, 120)), width: 1200, height: 630, alt: c.h1 }],
    },
  };
}

const OUTLOOK_STYLE: Record<Outlook, string> = {
  likely: "bg-emerald-50 border-emerald-200 text-emerald-900",
  marginal: "bg-amber-50 border-amber-200 text-amber-900",
  unlikely: "bg-rose-50 border-rose-200 text-rose-900",
  unknown: "bg-slate-50 border-slate-200 text-slate-700",
};

const OUTLOOK_DOT: Record<Outlook, string> = {
  likely: "bg-emerald-500",
  marginal: "bg-amber-500",
  unlikely: "bg-rose-500",
  unknown: "bg-slate-400",
};

function formatDate(iso: string, loc: string): string {
  try {
    return new Intl.DateTimeFormat(loc === "pt-BR" ? "pt-BR" : loc, {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Europe/Istanbul",
    }).format(new Date(`${iso}T12:00:00+03:00`));
  } catch {
    return iso;
  }
}

function num(v: number | null, unit: string): string {
  return v === null ? "—" : `${Math.round(v)} ${unit}`;
}

function DayRow({ s, loc, c }: { s: SunriseSlot; loc: string; c: ReturnType<typeof flyingTodayCopy> }) {
  return (
    <tr className="border-t border-slate-200">
      <td className="py-3 pr-3 font-medium text-slate-900 whitespace-nowrap">{formatDate(s.date, loc)}</td>
      <td className="py-3 pr-3 text-slate-700">{s.sunrise}</td>
      <td className="py-3 pr-3 text-slate-700">{num(s.windKmh, "km/h")}</td>
      <td className="py-3 pr-3 text-slate-700">{num(s.gustKmh, "km/h")}</td>
      <td className="py-3 pr-3 text-slate-700">{s.visibilityKm === null ? "—" : `${s.visibilityKm} km`}</td>
      <td className="py-3 pr-3 text-slate-700">{num(s.rainProbability, "%")}</td>
      <td className="py-3">
        <span className="inline-flex items-center gap-2 text-sm font-semibold">
          <span className={`w-2.5 h-2.5 rounded-full ${OUTLOOK_DOT[s.outlook]}`} />
          {c.outlook[s.outlook]}
        </span>
      </td>
    </tr>
  );
}

export default async function FlyingTodayPage({ params }: { params: { locale: string } }) {
  const loc: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const c = flyingTodayCopy(loc);
  const nav = serverDict(loc).nav;
  const forecast = await fetchFlightForecast();
  const today = forecast?.days[0] ?? null;
  const outlook: Outlook = today?.outlook ?? "unknown";
  const updated = forecast
    ? new Intl.DateTimeFormat(loc === "pt-BR" ? "pt-BR" : loc, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Istanbul",
      }).format(new Date(forecast.fetchedAt))
    : null;

  return (
    <>
      <section className="bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white">
        <div className="container-main py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">{c.h1}</h1>
          <p className="text-white/85 text-lg max-w-3xl">{c.intro}</p>
        </div>
      </section>

      <Breadcrumb
        items={[
          { name: nav.balloons, href: "/balonlar" },
          { name: c.h1, href: PATH },
        ]}
      />

      <div className="bg-slate-50 py-10">
        <div className="container-main space-y-8">
          {/* Today */}
          <section className={`rounded-2xl border p-6 sm:p-8 ${OUTLOOK_STYLE[outlook]}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <h2 className="text-xl font-bold">
                {c.today}{today ? ` — ${formatDate(today.date, loc)}` : ""}
              </h2>
              {updated && (
                <span className="text-xs opacity-75">
                  {c.updated}: {updated}
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3 mb-2">
              <span className={`w-4 h-4 rounded-full ${OUTLOOK_DOT[outlook]}`} />
              {c.outlook[outlook]}
            </p>
            <p className="mb-5 opacity-90">{c.outlookNote[outlook]}</p>
            {today ? (
              <dl className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                <div><dt className="opacity-70">{c.sunrise}</dt><dd className="font-semibold text-lg">{today.sunrise}</dd></div>
                <div><dt className="opacity-70">{c.wind}</dt><dd className="font-semibold text-lg">{num(today.windKmh, "km/h")}</dd></div>
                <div><dt className="opacity-70">{c.gusts}</dt><dd className="font-semibold text-lg">{num(today.gustKmh, "km/h")}</dd></div>
                <div><dt className="opacity-70">{c.visibility}</dt><dd className="font-semibold text-lg">{today.visibilityKm === null ? "—" : `${today.visibilityKm} km`}</dd></div>
                <div><dt className="opacity-70">{c.rain}</dt><dd className="font-semibold text-lg">{num(today.rainProbability, "%")}</dd></div>
              </dl>
            ) : (
              <p className="text-sm">{c.unavailable}</p>
            )}
          </section>

          <p className="rounded-xl bg-white border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed">
            <strong className="text-slate-900">⚠︎ </strong>
            {c.disclaimer}
          </p>

          {/* Next days */}
          {forecast && forecast.days.length > 1 && (
            <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 overflow-x-auto">
              <h2 className="text-xl font-bold text-slate-900 mb-4">{c.nextDays}</h2>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-2 pr-3">{c.today}</th>
                    <th className="pb-2 pr-3">{c.sunrise}</th>
                    <th className="pb-2 pr-3">{c.wind}</th>
                    <th className="pb-2 pr-3">{c.gusts}</th>
                    <th className="pb-2 pr-3">{c.visibility}</th>
                    <th className="pb-2 pr-3">{c.rain}</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.days.map((s) => (
                    <DayRow key={s.date} s={s} loc={loc} c={c} />
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-slate-500">{c.source}</p>
            </section>
          )}

          {/* CTA */}
          <section className="bg-primary text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">{c.ctaTitle}</h2>
              <p className="text-white/85 text-sm max-w-xl">{c.ctaText}</p>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <Link href="/balonlar" className="inline-flex items-center justify-center bg-accent text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition">
                {c.ctaButton}
              </Link>
              <Link href="/operatorler" className="text-sm text-white/80 underline underline-offset-2">
                {c.operatorsLink}
              </Link>
            </div>
          </section>

          {/* Why / booking / tips */}
          <div className="grid lg:grid-cols-3 gap-6">
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3">{c.whyTitle}</h2>
              <ul className="space-y-3 text-sm text-slate-700 leading-relaxed">
                {c.why.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </section>
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3">{c.bookingTitle}</h2>
              <ul className="space-y-3 text-sm text-slate-700 leading-relaxed">
                {c.booking.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </section>
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3">{c.tipsTitle}</h2>
              <ul className="space-y-3 text-sm text-slate-700 leading-relaxed list-disc pl-4">
                {c.tips.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </section>
          </div>

          {/* FAQ */}
          <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{c.faqTitle}</h2>
            <div className="divide-y divide-slate-200">
              {c.faq.map((f) => (
                <details key={f.q} className="py-3 group">
                  <summary className="cursor-pointer font-semibold text-slate-900 list-none flex justify-between items-center">
                    {f.q}
                    <span className="text-slate-400 group-open:rotate-45 transition">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: nav.balloons, href: canonicalFor("/balonlar", loc) },
            { name: c.h1, href: canonicalFor(PATH, loc) },
          ]),
          faqPageSchema(c.faq.map((f) => ({ question: f.q, answer: f.a }))),
        ]}
      />
    </>
  );
}
