"use client";

import NextImage from "next/image";
import { Link } from "@/i18n/routing";
import {
  Wind,
  Clock,
  Users,
  Star,
  Check,
  X,
  AlertTriangle,
  Shield,
  Calendar,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { formatPrice } from "@/lib/utils";
import { useT, useLocale } from "@/lib/i18n/I18nProvider";
import { tBalloon, tFaq } from "@/lib/i18n/localizeData";
import { FAQ_ITEMS } from "@/data/faq";
import type { BalloonPackage } from "@/data/services/balloons";
import type { Operator } from "@/data/services/operators";
import type { FAQItem } from "@/data/faq";

interface BalonDetayContentProps {
  pkg: BalloonPackage;
  operators: Operator[];
  balonFaqs: FAQItem[];
}

export function BalonDetayContent({
  pkg: pkgRaw,
  operators,
  balonFaqs: balonFaqsRaw,
}: BalonDetayContentProps) {
  const t = useT();
  const { locale } = useLocale();
  const s = t.page.balonlar.slug;

  const pkg = tBalloon(pkgRaw, locale);
  // tFaq(locale) base FAQ_ITEMS ile ayni sira/uzunlukta; base TR question -> cevrili item map.
  const localizedFaqs = tFaq(locale);
  const faqByBaseQuestion = new Map(
    FAQ_ITEMS.map((item, i) => [item.question, localizedFaqs[i]])
  );
  const balonFaqs = balonFaqsRaw.map(
    (f) => faqByBaseQuestion.get(f.question) ?? f
  );

  return (
    <>
      <Breadcrumb
        items={[
          { name: s.balon_turlari, href: "/balonlar" },
          { name: pkg.name, href: `/balonlar/${pkg.slug}` },
        ]}
      />

      <article className="bg-white">
        <div className="container-main py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main */}
            <div className="lg:col-span-2">
              {/* Hero / gallery — gercek foto (pkg.images[0]); yoksa gradient + Wind fallback */}
              <div className={`relative h-72 lg:h-96 rounded-2xl flex items-center justify-center mb-8 overflow-hidden ${pkg.images[0] ? "bg-slate-100" : "bg-gradient-to-br from-primary via-primary-light to-accent"}`}>
                {pkg.images[0] ? (
                  <NextImage
                    src={pkg.images[0]}
                    alt={`${pkg.name} — Kapadokya`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                  />
                ) : (
                  <Wind className="w-32 h-32 text-white/70" strokeWidth={1} />
                )}
                <div className="absolute top-4 left-4 bg-white text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase shadow-md">
                  {pkg.badge}
                </div>
                <div className="absolute top-4 right-4 bg-white/95 text-primary px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-warning text-warning" />
                  {pkg.rating} ({pkg.reviewCount.toLocaleString("tr-TR")})
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
                {pkg.name}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-6 speakable">
                {pkg.longDescription}
              </p>

              {/* Quick facts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-xs text-slate-500">{s.sure}</div>
                  <div className="font-bold text-slate-900">{pkg.duration}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <Users className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-xs text-slate-500">{s.sepet}</div>
                  <div className="font-bold text-slate-900">
                    {pkg.capacity.min}-{pkg.capacity.max} {s.kisi}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <Shield className="w-5 h-5 text-success mx-auto mb-2" />
                  <div className="text-xs text-slate-500">{s.sigorta}</div>
                  <div className="font-bold text-slate-900">40M€</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <Calendar className="w-5 h-5 text-accent mx-auto mb-2" />
                  <div className="text-xs text-slate-500">{s.min_yas}</div>
                  <div className="font-bold text-slate-900">{pkg.minAge}+</div>
                </div>
              </div>

              {/* Includes / Excludes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="bg-success/[0.06] border border-success/20 rounded-2xl p-5">
                  <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" /> {s.fiyata_dahil}
                  </h2>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {pkg.includes.map((it) => (
                      <li key={it} className="flex gap-2">
                        <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <X className="w-5 h-5 text-slate-500" /> {s.dahil_degil}
                  </h2>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {pkg.excludes.map((it) => (
                      <li key={it} className="flex gap-2">
                        <X className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Warnings */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-10">
                <h2 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  {s.onemli_uyarilar_saglik_kosullari}
                </h2>
                <ul className="space-y-2 text-sm text-amber-900">
                  {pkg.warnings.map((w) => (
                    <li key={w} className="flex gap-2">
                      <span className="text-amber-600 font-bold">·</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Operators */}
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
                {s.paketteki_operatorler}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                {operators.map((op) => (
                  <div
                    key={op.id}
                    className="border border-slate-200 rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-primary/[0.08] rounded-lg flex items-center justify-center">
                      <Wind className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm">{op.name}</h4>
                      <div className="text-xs text-slate-500">
                        {s.lisans_prefix} {op.licenseNo} · {op.founded}{s.beri}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                      <span className="font-bold">{op.rating}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ */}
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">
                {s.sik_sorulan_sorular}
              </h2>
              <div className="space-y-3">
                {balonFaqs.map((f) => (
                  <details
                    key={f.question}
                    className="group bg-slate-50 rounded-xl border border-slate-200 p-4"
                  >
                    <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                      <span>{f.question}</span>
                      <span className="text-accent text-xl group-open:rotate-45 transition-transform">
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* Sticky aside — price box */}
            <aside className="lg:sticky lg:top-24 self-start">
              <div className="card p-6 border-2 border-accent/20">
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-bold">
                  {s.kisi_basi}
                </div>
                <div className="text-xs text-slate-400 line-through">
                  {formatPrice(pkg.marketPrice, pkg.currency)}
                </div>
                <div className="text-4xl font-extrabold text-primary leading-none mb-1">
                  {formatPrice(pkg.adultPrice, pkg.currency)}
                </div>
                <div className="text-xs text-success font-semibold mb-5">
                  %{Math.round(((pkg.marketPrice - pkg.adultPrice) / pkg.marketPrice) * 100)}{" "}
                  {s.daha_ucuz_en_dusuk_fiyat}
                </div>

                <Link
                  href={{ pathname: "/rezervasyon/[slug]", params: { slug: pkg.slug }, hash: "tarih" }}
                  className="btn-accent w-full block text-center mb-2"
                >
                  {s.tarih_sec_rezerve_et}
                </Link>
                <p className="text-xs text-center text-slate-500 mb-3">
                  {s.tarih_seciminde_gunluk_doluluk}
                </p>
                <Link
                  href="/iletisim"
                  className="block text-center text-sm font-semibold text-primary hover:underline"
                >
                  {s.soru_sor_whatsapp_email}
                </Link>

                <hr className="my-5 border-slate-200" />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Shield className="w-4 h-4 text-success" />
                    <span>{s.iade_operator_iptali}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Shield className="w-4 h-4 text-success" />
                    <span>{s["40m_ucus_sigortasi"]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Shield className="w-4 h-4 text-success" />
                    <span>{s["3d_secure_odeme"]}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
