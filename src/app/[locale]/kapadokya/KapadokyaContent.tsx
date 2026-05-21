"use client";

import { Link } from "@/i18n/routing";
import { Wind, MountainSnow, TreePine, Package, BookOpen, Mountain } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { useT } from "@/lib/i18n/I18nProvider";
import { KAPADOKYA_PILLARS } from "@/data/services/catalog";

export function KapadokyaContent() {
  const t = useT();
  const d = t.page.kapadokya;

  const CATEGORIES = [
    {
      href: "/balonlar",
      icon: Wind,
      title: d.cat_title_balon,
      desc: d.cat_desc_balon,
      color: "from-accent to-accent-light",
    },
    {
      href: "/aktiviteler",
      icon: MountainSnow,
      title: d.cat_title_aktiviteler,
      desc: d.cat_desc_aktiviteler,
      color: "from-success to-success-light",
    },
    {
      href: "/turlar",
      icon: TreePine,
      title: d.cat_title_gezi_turlari,
      desc: d.cat_desc_gezi_turlari,
      color: "from-primary to-primary-light",
    },
    {
      href: "/paketler",
      icon: Package,
      title: d.cat_title_kombo,
      desc: d.cat_desc_kombo,
      color: "from-warning to-warning-light",
    },
  ];

  return (
    <>
      <PageHero
        tag={d.pagehero_tag_kapadokya}
        title={d.pagehero_title_kapadokya}
        highlight={d.pagehero_highlight_tatil_rehberi}
        description={d.pagehero_description_unesco_dunya}
      />

      <Breadcrumb items={[{ name: d.pagehero_title_kapadokya, href: "/kapadokya" }]} />

      {/* Intro */}
      <section className="bg-white section-padding">
        <div className="container-main max-w-4xl">
          <div className="prose-lg text-slate-700 space-y-4 leading-relaxed">
            <p className="text-lg speakable">
              <strong>{d.kapadokya_title}</strong>{d.turkiye_nin_ic_anadolu}
              <strong> {d.unesco_dunya_mirasi_listesi_nde}</strong> {d.bulunan_dunyaca_unlu_tatil}{" "}
              <strong>{d.peri_bacalari}</strong>{d.bizans_donemine_ait_kayaya_oyma}
            </p>
            <p>
              {d.kapadokya_denildiginde_akla_ilk}{" "}
              <strong>{d.sicak_hava_balon_turlaridir}</strong>{d.gun_dogumunda_yuzlerce_renkli}{" "}
              <strong>{d.fazla_tursab_lisansli_operator}</strong> {d.tarafindan_sunulur_standart_165}
            </p>
            <p>
              {d.balon_disinda_atv_turlari_binme} <strong>{d.nisan_haziran}</strong> {d.ve}{" "}
              <strong>{d.eylul_ekim}</strong>{" "}
              {d.araligidir_balon_ucus_oranlari}
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="text-center mb-12">
            <span className="section-tag">{d.kategoriler}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              {d.yapabilirsiniz}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="card overflow-hidden group"
              >
                <div className={`h-32 bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                  <c.icon className="w-14 h-14 text-white/90 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 mb-1.5">{c.title}</h3>
                  <p className="text-sm text-slate-600">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pillar articles */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="text-center mb-12">
            <span className="section-tag">{d.detayli_rehberler}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              {d.kapadokya_hakkinda_bilgi_bankasi}
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              {d.planlamadan_en_iyi_fotograf}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {KAPADOKYA_PILLARS.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="card p-6 group flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/[0.08] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-600">{p.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white section-padding">
        <div className="container-main text-center">
          <Mountain className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            {d.kapadokya_maceraniz_simdi}
          </h2>
          <p className="text-lg text-white/85 mb-6 max-w-2xl mx-auto">
            {d.en_dusuk_fiyat_garantisi_100}
          </p>
          <Link href="/balonlar" className="btn-accent inline-block text-base">
            {d.balon_turlarina_bak}
          </Link>
        </div>
      </section>
    </>
  );
}
