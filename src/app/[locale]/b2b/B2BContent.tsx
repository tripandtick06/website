"use client";

import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { B2BApplyForm } from "@/components/b2b/B2BApplyForm";
import { Tag, Code2, Headphones, Percent, LogIn, ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";

export function B2BContent() {
  const t = useT();

  const BENEFITS = [
    {
      icon: Tag,
      title: t.page.b2b.benefit_toplu_fiyat_title,
      desc: t.page.b2b.benefit_toplu_fiyat_desc,
    },
    {
      icon: Code2,
      title: t.page.b2b.benefit_rest_api_title,
      desc: t.page.b2b.benefit_rest_api_desc,
    },
    {
      icon: Headphones,
      title: t.page.b2b.benefit_hesap_yoneticisi_title,
      desc: t.page.b2b.benefit_hesap_yoneticisi_desc,
    },
    {
      icon: Percent,
      title: t.page.b2b.benefit_komisyon_title,
      desc: t.page.b2b.benefit_komisyon_desc,
    },
  ];

  return (
    <>
      <PageHero
        tag={t.page.b2b.pagehero_tag_acente_programi}
        title={t.page.b2b.pagehero_title_b2b_acente}
        highlight={t.page.b2b.pagehero_highlight_programi}
        description={t.page.b2b.pagehero_description_seyahat}
      />

      <Breadcrumb items={[{ name: t.page.b2b.breadcrumb_b2b, href: "/b2b" }]} />

      {/* Avantajlar */}
      <section className="section-padding">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              {t.page.b2b.neden_trip_tick_b2b}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {t.page.b2b.kapadokya_envanterinde_en_guclu}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-elevated transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Mevcut acente giris */}
      <section className="section-padding bg-slate-50">
        <div className="container-main grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form (3 col) */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              {t.page.b2b.acente_basvuru_formu}
            </h2>
            <p className="text-slate-600 mb-6">
              {t.page.b2b.basvurunuzu_24_saat_icinde}
            </p>
            <B2BApplyForm />
          </div>

          {/* Mevcut acente giris (2 col) */}
          <aside className="lg:col-span-2">
            <div className="bg-slate-900 text-white rounded-2xl p-7 sticky top-24">
              <LogIn className="w-8 h-8 text-accent mb-3" />
              <h3 className="text-xl font-extrabold mb-2">{t.page.b2b.zaten_acente_misiniz}</h3>
              <p className="text-slate-300 text-sm mb-5">
                {t.page.b2b.dashboard_giris_yapip}
              </p>
              <Link
                href="/b2b/login"
                className="inline-flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-light text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {t.page.b2b.b2b_giris}
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-400">
                <p className="mb-1">
                  <span className="text-slate-200 font-semibold">Demo:</span> acente@example.com
                </p>
                <p>
                  <span className="text-slate-200 font-semibold">{t.page.b2b.api_key}</span>{" "}
                  <code className="bg-slate-800 px-1.5 py-0.5 rounded">tt_b2b_demo123</code>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
