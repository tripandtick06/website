"use client";

// Importers: page.tsx (operatorler/[id])
// Affected: operator detail JSX body — chrome strings → useT()
// Data: op (Operator), packages (BalloonPackage[]), reviews (Review[])
// User verbatim: "JSX gövdesi YENİ OperatorDetayContent.tsx"

import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { useT } from "@/lib/i18n/I18nProvider";
import { formatPrice, cn } from "@/lib/utils";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Calendar,
  Users as UsersIcon,
  ShieldCheck,
  Award,
  Languages,
  CheckCircle2,
} from "lucide-react";
import type { Operator } from "@/data/services/operators";
import type { BalloonPackage } from "@/data/services/balloons";
import type { Review } from "@/data/reviews";

interface OperatorDetayContentProps {
  op: Operator;
  packages: BalloonPackage[];
  reviews: Review[];
  yearsActive: number;
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
  yearsActive,
}: OperatorDetayContentProps) {
  const t = useT();
  const ti = t.page.operatorler.id;

  return (
    <>
      <section className="bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white">
        <div className="container-main py-14 sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/[0.08] text-white/90 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-sm border border-white/10">
              {ti.operator_lisans} {op.licenseNo}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
              {op.name}
            </h1>
            {op.tagline && (
              <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-6">
                {op.tagline}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-semibold">
                <Star className="w-4 h-4 fill-warning text-warning" />
                {op.rating.toFixed(2)} / 5.0
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-sm">
                {op.reviewCount.toLocaleString("tr-TR")} {ti.yorum}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-sm">
                <Calendar className="w-4 h-4" /> {op.founded} ({yearsActive}{ti.yil}
              </span>
              {op.fleetSize && (
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-sm">
                  <ShieldCheck className="w-4 h-4" /> {op.fleetSize} {ti.balon_kelimesi}
                </span>
              )}
            </div>
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
                {op.description}
              </p>
              {op.specialties && op.specialties.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {ti.uzmanlik_alanlari}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {op.specialties.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {packages.length > 0 && (
              <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  {op.name} {ti.balon_paketleri}
                </h2>
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
                        <span className="text-xs flex items-center gap-0.5 text-slate-500">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {pkg.rating}
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
              </section>
            )}

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
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4">{ti.kunye}</h3>
              <div className="space-y-3 text-sm">
                <KeyValue
                  label={ti.keyvalue_label_shgm_lisansi}
                  value={op.licenseNo}
                  icon={<Award className="w-4 h-4" />}
                />
                <KeyValue
                  label={ti.keyvalue_label_kurulus}
                  value={`${op.founded} (${yearsActive}${ti.yil}`}
                  icon={<Calendar className="w-4 h-4" />}
                />
                {op.fleetSize && (
                  <KeyValue
                    label={ti.keyvalue_label_filo}
                    value={`${op.fleetSize} ${ti.balon_kelimesi}`}
                    icon={<ShieldCheck className="w-4 h-4" />}
                  />
                )}
                {op.pilotCount && (
                  <KeyValue
                    label={ti.keyvalue_label_pilot_kadrosu}
                    value={`${op.pilotCount} ${ti.pilot_kelimesi}`}
                    icon={<UsersIcon className="w-4 h-4" />}
                  />
                )}
                {op.address && (
                  <KeyValue
                    label={ti.keyvalue_label_adres}
                    value={op.address}
                    icon={<MapPin className="w-4 h-4" />}
                  />
                )}
                {op.phone && (
                  <KeyValue
                    label={ti.keyvalue_label_telefon}
                    value={op.phone}
                    icon={<Phone className="w-4 h-4" />}
                  />
                )}
                {op.website && (
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
                )}
                {op.languages && op.languages.length > 0 && (
                  <KeyValue
                    label={ti.keyvalue_label_diller}
                    value={op.languages.join(", ")}
                    icon={<Languages className="w-4 h-4" />}
                  />
                )}
              </div>
            </div>

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

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {ti.sertifikalar}
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>{ti.shgm_ticari_hava_araci_isletme}</li>
                <li>{ti.easa_part_bop_balloon_operations}</li>
                <li>{ti.tursab_uyeligi}</li>
                <li>{ti["40m_eur_ucuncu_sahis_sorumluluk"]}</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
