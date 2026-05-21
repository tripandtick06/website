"use client";

import { GdprForm } from "./GdprForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { useT } from "@/lib/i18n/I18nProvider";

export function GdprContent() {
  const t = useT();
  const d = t.page.gdpr;

  return (
    <>
      <PageHero
        tag={d.pagehero_tag}
        title={d.pagehero_title}
        description={d.pagehero_description}
      />

      <Breadcrumb items={[{ name: d.breadcrumb_name, href: "/gdpr" }]} />

      <section className="section-padding">
        <div className="container-main max-w-2xl">
          <div className="card p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{d.h2_talep_formu}</h2>
            <p className="text-slate-600 mb-6">
              {d.talep_formu_description_prefix}<strong>{d.talep_formu_24_saat}</strong>{d.talep_formu_description_suffix}
            </p>
            <GdprForm />
          </div>

          <div className="mt-8 space-y-4 text-sm text-slate-600">
            <h3 className="text-lg font-semibold text-slate-900">{d.h3_neyi_indirebilirim}</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>{d.li_musteri_profil}</li>
              <li>{d.li_rezervasyon_kayitlari}</li>
              <li>{d.li_sadakat_puan}</li>
            </ul>
            <p className="text-xs text-slate-500">
              {d.stripe_note_prefix}{" "}
              <a href="mailto:hello@tripandtick.com" className="text-primary underline">
                hello@tripandtick.com
              </a>{" "}
              {d.stripe_note_suffix}
            </p>

            <h3 className="text-lg font-semibold text-slate-900 mt-6">{d.h3_silme_ne_olur}</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>{d.li_profil_silinir}</li>
              <li>{d.li_rezervasyon_anonimlestirilir}</li>
              <li>{d.li_newsletter_iptal}</li>
              <li>{d.li_fatura_saklanir}</li>
            </ul>

            <p className="text-xs text-slate-500 mt-4">
              {d.kvkk_sorumlu_prefix}{" "}
              <a href="mailto:hello@tripandtick.com" className="text-primary underline">
                hello@tripandtick.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
