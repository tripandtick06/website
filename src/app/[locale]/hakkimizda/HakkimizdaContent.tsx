"use client";

import NextImage from "next/image";
import { Link } from "@/i18n/routing";
import {
  Shield,
  Users,
  Star,
  Award,
  Heart,
  Target,
  Eye,
  Trophy,
  Mail,
  Phone,
  MapPin,
  Receipt,
  Calendar,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { useT } from "@/lib/i18n/I18nProvider";
import { COMPANY, FOUNDER, telHref } from "@/data/founder";

export function HakkimizdaContent() {
  const t = useT();
  const d = t.page.hakkimizda;

  const STATS = [
    { icon: Users, value: "12.000+", label: d.stat_label_mutlu_musteri },
    { icon: Star, value: "4.9 / 5", label: d.stat_label_musteri_puani },
    { icon: Shield, value: "9+", label: d.stat_label_lisansli_operator },
    { icon: Award, value: "%100", label: d.stat_label_iade_garantisi },
  ];

  const VALUES = [
    {
      icon: Heart,
      title: d.value_title_musteri_once,
      desc: d.value_desc_musteri_once,
    },
    {
      icon: Shield,
      title: d.value_title_guven,
      desc: d.value_desc_guven,
    },
    {
      icon: Target,
      title: d.value_title_seffaflik,
      desc: d.value_desc_seffaflik,
    },
    {
      icon: Trophy,
      title: d.value_title_en_iyi_fiyat,
      desc: d.value_desc_en_iyi_fiyat,
    },
  ];

  return (
    <>
      <PageHero
        tag={d.pagehero_tag_hakkimizda}
        title={d.pagehero_title_trip_tick}
        highlight={d.hikayemiz}
        description={d.pagehero_description_kapadokya_nin}
      />

      <Breadcrumb items={[{ name: d.pagehero_tag_hakkimizda, href: "/hakkimizda" }]} />

      <section className="bg-white py-12 border-b border-slate-200">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-10 h-10 text-accent mx-auto mb-2" />
                <div className="text-3xl font-extrabold text-primary">{s.value}</div>
                <div className="text-sm text-slate-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-main max-w-4xl">
          <span className="section-tag">{d.hikayemiz}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
            {d.neden_trip_tick}
          </h2>
          <div className="space-y-4 text-slate-700 leading-relaxed text-lg">
            <p>
              {d.trip_tick_2024_yilinda_kapadokya}
            </p>
            <p>
              {d.geleneksel_acente_modeli} <strong>{d.yuzde_10_15_ortaklik_komisyonu}</strong> {d.musteriye}{" "}
              <strong>{d.en_dusuk_net_fiyat}</strong>{d.sonuc_ayni_paket_25_40}
            </p>
            <p>
              <strong>{d.tursab_lisansimiz}</strong> {d.turk_turizm_standartlarina_uyum}
            </p>
            <p>
              {d.kapadokya_satilan_her_balon}{" "}
              <strong>{d.yerel_istihdama_destek}</strong> {d.ilkesiyle_calisiyor_dogru}
            </p>
            <p>
              {d.misafirlerimizin_92_si}
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-main max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary text-white rounded-2xl p-8">
              <Target className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-2xl font-extrabold mb-3">{d.misyonumuz}</h3>
              <p className="text-white/85 leading-relaxed">
                {d.kapadokya_tatilini_herkes} <strong>{d.uygun_fiyatli_seffaf_guvenli}</strong> {d.hale_getirmek_araci_komisyonunu}
              </p>
            </div>
            <div className="bg-accent text-white rounded-2xl p-8">
              <Eye className="w-10 h-10 text-white mb-4" />
              <h3 className="text-2xl font-extrabold mb-3">{d.vizyonumuz}</h3>
              <p className="text-white/95 leading-relaxed">
                {d.vizyonumuz_2027} <strong>{d.turkiye_nin_en_guvenilir_online}</strong> {d.olmak_kapadokya_baslayarak}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-main max-w-5xl">
          <div className="text-center mb-10">
            <span className="section-tag">{d.degerlerimiz}</span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              {d.bizi_digerlerinden_ayiran_ilke}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-accent/[0.08] flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-accent" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{v.title}</h4>
                <p className="text-slate-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder / Kurucu Ekip */}
      <section className="section-padding bg-white">
        <div className="container-main max-w-5xl">
          <div className="text-center mb-10">
            <span className="section-tag">{d.kurucu_ekip}</span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              {d.trip_tick_arkasindaki_ekip}
            </h2>
          </div>
          <div className="card p-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-full bg-accent/[0.1] flex items-center justify-center shrink-0">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900">
                  {FOUNDER.name}
                </h3>
                <div className="text-sm text-accent font-semibold mt-1 mb-3">
                  {FOUNDER.title}
                </div>
                <p className="text-slate-700 leading-relaxed mb-4">
                  {FOUNDER.bio}
                </p>
                <a
                  href={`mailto:${FOUNDER.email}`}
                  className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                >
                  <Mail className="w-4 h-4" /> {FOUNDER.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company contact grid */}
      <section className="section-padding bg-slate-50">
        <div className="container-main max-w-5xl">
          <div className="text-center mb-10">
            <span className="section-tag">{d.sirket_bilgileri}</span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              {COMPANY.legalName}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="card p-6">
              <Phone className="w-7 h-7 text-accent mb-3" />
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                {d.telefon}
              </div>
              <a
                href={telHref(COMPANY.phone)}
                className="text-slate-900 font-semibold hover:text-accent"
              >
                {COMPANY.phone}
              </a>
            </div>
            <div className="card p-6">
              <Mail className="w-7 h-7 text-accent mb-3" />
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                {d.eposta}
              </div>
              <a
                href={`mailto:${COMPANY.email}`}
                className="block text-slate-900 font-semibold hover:text-accent"
              >
                {COMPANY.email}
              </a>
              <a
                href={`mailto:${COMPANY.altEmail}`}
                className="block text-sm text-slate-600 hover:text-accent mt-1"
              >
                {COMPANY.altEmail}
              </a>
            </div>
            <div className="card p-6">
              <Receipt className="w-7 h-7 text-accent mb-3" />
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                {d.fatura_muhasebe}
              </div>
              <a
                href={`mailto:${COMPANY.billingEmail}`}
                className="text-slate-900 font-semibold hover:text-accent"
              >
                {COMPANY.billingEmail}
              </a>
            </div>
            <div className="card p-6">
              <MapPin className="w-7 h-7 text-accent mb-3" />
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                {d.adres}
              </div>
              <div className="text-slate-900 font-semibold leading-snug">
                {COMPANY.address.street}
                <br />
                {COMPANY.address.locality}, {COMPANY.address.region}{" "}
                {COMPANY.address.postalCode}
                <br />
                {d.turkiye}
              </div>
            </div>
            <div className="card p-6">
              <NextImage
                src="/images/tursab.png"
                alt="TÜRSAB üyesi operatörler"
                width={44}
                height={44}
                className="h-11 w-11 mb-3"
              />
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                {d.tursab_lisans_no}
              </div>
              <div className="text-slate-900 font-semibold">9+</div>
            </div>
            <div className="card p-6">
              <Calendar className="w-7 h-7 text-accent mb-3" />
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                {d.kurulus}
              </div>
              <div className="text-slate-900 font-semibold">
                {new Date(COMPANY.foundingDate).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="container-main text-center">
          <h2 className="text-3xl font-extrabold mb-3">{d.sorulariniz_var}</h2>
          <p className="text-white/85 mb-6 max-w-xl mx-auto">
            {d.ekibimiz_24_hizmetinizde}
          </p>
          <Link href="/iletisim" className="btn-accent inline-block">
            {d.iletisime_gec}
          </Link>
        </div>
      </section>
    </>
  );
}
