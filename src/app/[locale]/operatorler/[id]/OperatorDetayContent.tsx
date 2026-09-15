"use client";

// Importers: page.tsx (operatorler/[id])
// Affected: operator detail JSX body — chrome strings → useT()
// Data: op (Operator), packages (BalloonPackage[]), reviews (Review[])
// User verbatim: "JSX gövdesi YENİ OperatorDetayContent.tsx"

import NextImage from "next/image";
import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { useT, useLocale } from "@/lib/i18n/I18nProvider";
import { formatPrice, cn } from "@/lib/utils";
import { Star, Globe, ChevronDown } from "lucide-react";
import { operatorDescription, operatorTagline } from "@/data/services/operators";
import type { Operator } from "@/data/services/operators";
import type { BalloonPackage } from "@/data/services/balloons";
import type { Review } from "@/data/reviews";
import type { OperatorFaqItem } from "@/lib/operator-faq";

interface OperatorDetayContentProps {
  op: Operator;
  packages: BalloonPackage[];
  reviews: Review[];
  faqs: OperatorFaqItem[];
}

function KeyValue({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-slate-400 mt-0.5">{icon}</span>}
      <div className="flex-1">
        <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
          {label}
        </p>
        <p className="text-slate-800 font-medium">{value}</p>
      </div>
    </div>
  );
}

export function OperatorDetayContent({
  op,
  packages,
  reviews,
  faqs,
}: OperatorDetayContentProps) {
  const t = useT();
  const ti = t.page.operatorler.id;
  const { locale } = useLocale();
  const description = operatorDescription(op, locale);
  const tagline = operatorTagline(op, locale);
  const faqHeading = t.page.balonlar.slug.sik_sorulan_sorular;

  return (
    <>
      <section className="relative overflow-hidden text-white">
        {/* Kapak foto — Kapadokya balon; gradient overlay metni okunur tutar */}
        <NextImage
          src="/images/hero/homepage.jpg"
          alt="Kapadokya balon operatörü"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary-light/90 to-primary-dark/95" />
        <div className="container-main py-14 sm:py-20 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
              {op.name}
            </h1>
            {tagline && (
              <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                {tagline}
              </p>
            )}
          </div>
        </div>
      </section>

      <Breadcrumb
        items={[
          { name: t.page.operatorler.pagehero_tag_operatorler, href: "/operatorler" },
          { name: op.name, href: `/operatorler/${op.id}` },
        ]}
      />

      <div className="bg-slate-50 py-12">
        <div className="container-main grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {op.name} {ti.hakkinda}
              </h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {op.name} {ti.balon_paketleri}
              </h2>
              {packages.length > 0 ? (
                <>
                  <p className="text-slate-600 text-sm mb-6">
                    {ti.operatorun_gerceklestirdigi} {packages.length} {ti.paket_arasindan_secim}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {packages.map((pkg) => (
                      <Link
                        key={pkg.slug}
                        href={{ pathname: "/balonlar/[slug]", params: { slug: pkg.slug } }}
                        className="border border-slate-200 rounded-xl p-4 hover:border-amber-400 hover:shadow-md transition-all flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={cn(
                              "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                              pkg.badgeColor === "accent" && "bg-amber-100 text-amber-700",
                              pkg.badgeColor === "success" && "bg-emerald-100 text-emerald-700",
                              pkg.badgeColor === "warning" && "bg-rose-100 text-rose-700",
                              pkg.badgeColor === "primary" && "bg-indigo-100 text-indigo-700"
                            )}
                          >
                            {pkg.badge}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">{pkg.name}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mb-3 flex-1">
                          {pkg.shortDescription}
                        </p>
                        <div className="flex items-baseline justify-between pt-3 border-t border-slate-100">
                          <span className="text-xs text-slate-500">{pkg.duration}</span>
                          <span className="font-bold text-amber-600">
                            {formatPrice(pkg.adultPrice, pkg.currency)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-slate-600 text-sm mb-4">
                    {locale === "tr"
                      ? `Trip and Tick şu anda ${op.name} ile satışta olan bir paket sunmuyor.`
                      : `Trip and Tick does not currently sell a package with ${op.aliases[0] ?? op.name}.`}
                  </p>
                  <Link
                    href="/balonlar"
                    className="inline-flex items-center justify-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    {ti.paketleri_gor}
                  </Link>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {ti.misafir_yorumlari}
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                {op.name} {ti.ucus_yapan_misafirlerden_secili}
              </p>
              <div className="space-y-4">
                {reviews.map((r) => (
                  <article
                    key={r.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={cn(
                              "w-3.5 h-3.5",
                              n <= r.rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-slate-200"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs uppercase font-bold text-slate-400">
                        {r.service}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 italic mb-2">
                      &ldquo;{r.text}&rdquo;
                    </p>
                    <p className="text-xs text-slate-500">
                      {r.name} {r.flag} — {r.date}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 h-fit space-y-4">
            {op.website && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-4">{ti.kunye}</h3>
                <div className="space-y-3 text-sm">
                  <KeyValue
                    label={ti.keyvalue_label_web}
                    value={
                      <a
                        href={op.website}
                        target="_blank"
                        rel="noopener nofollow"
                        className="text-amber-600 hover:underline break-all"
                      >
                        {op.website.replace(/^https?:\/\//, "")}
                      </a>
                    }
                    icon={<Globe className="w-4 h-4" />}
                  />
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-2">{ti.rezervasyon}</h3>
              <p className="text-sm text-white/90 mb-4">
                {op.name} {ti.ucmak_trip_tick_uzerinden_tek}
              </p>
              <Link
                href="/balonlar"
                className="block text-center bg-white text-amber-600 font-bold py-2.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {ti.paketleri_gor}
              </Link>
            </div>
          </aside>
        </div>

        <div className="container-main pb-12">
          <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{faqHeading}</h2>
            <div className="space-y-3">
              {faqs.map((f) => (
                <details
                  key={f.question}
                  className="group bg-slate-50 rounded-xl border border-slate-200 p-4"
                >
                  <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between list-none">
                    {f.question}
                    <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
