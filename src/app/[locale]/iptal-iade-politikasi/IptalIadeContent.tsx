"use client";

import { Shield, Clock, Check, AlertTriangle } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { useT } from "@/lib/i18n/I18nProvider";

export function IptalIadeContent() {
  const t = useT();
  const d = t.page.iptal_iade_politikasi;

  const POLICY_ROWS = [
    {
      time: d.policy_row_time_72plus,
      refund: d.policy_row_refund_72plus,
      color: "text-success",
      bg: "bg-success/[0.06]",
    },
    {
      time: d.policy_row_time_24_72,
      refund: d.policy_row_refund_24_72,
      color: "text-warning",
      bg: "bg-warning/[0.06]",
    },
    {
      time: d.policy_row_time_24_less,
      refund: d.policy_row_refund_24_less,
      color: "text-danger",
      bg: "bg-danger/[0.06]",
    },
    {
      time: d.policy_row_time_operator,
      refund: d.policy_row_refund_operator,
      color: "text-success",
      bg: "bg-success/[0.06]",
    },
    {
      time: d.policy_row_time_saglik,
      refund: d.policy_row_refund_saglik,
      color: "text-success",
      bg: "bg-success/[0.06]",
    },
  ];

  return (
    <>
      <PageHero
        tag={d.pagehero_tag_yasal}
        title={d.pagehero_title_iptal}
        highlight={d.pagehero_highlight_iade_politikasi}
        description={d.pagehero_description_adil_seffaf}
      />

      <Breadcrumb items={[{ name: d.breadcrumb_iptal_iade, href: "/iptal-iade-politikasi" }]} />

      <article className="section-padding bg-white">
        <div className="container-main max-w-4xl">
          <p className="text-sm text-slate-500 mb-6">
            {d.yururluk_tarihi_mayis_2026_son}
          </p>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-accent" />
            {d.iptal_suresi_iade_tablosu}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 mb-10">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left py-3 px-4 font-bold text-slate-900">{d.iptal_zamani}</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-900">{d.iade_tutari}</th>
                </tr>
              </thead>
              <tbody>
                {POLICY_ROWS.map((row, idx) => (
                  <tr key={idx} className={`${row.bg} border-t border-slate-200`}>
                    <td className="py-3 px-4 font-semibold text-slate-800">{row.time}</td>
                    <td className={`py-3 px-4 font-bold ${row.color}`}>{row.refund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-extrabold mt-10 mb-3 text-slate-900">
            {d.musteri_kaynakli_iptal}
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            {d.plan_degisikligi_kisisel}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
            <li><strong>{d["72_saat_daha_oncesinden_iptal"]}</strong> {d.odediginiz_tutarin_100_iade}</li>
            <li><strong>{d["24_72_saat_arasi_iptal"]}</strong> {d.odediginiz_tutarin_50_si_iade}</li>
            <li><strong>{d["24_saatten_az_iptal"]}</strong> {d.iade_hakki_yoktur_saglik_raporu}</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-10 mb-3 text-slate-900">
            {d.hava_operator_kaynakli_iptal}
          </h2>
          <div className="bg-success/[0.06] border border-success/20 rounded-2xl p-5 mb-6">
            <div className="flex gap-3">
              <Shield className="w-6 h-6 text-success flex-shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 mb-2">{d.yuzde_100_iade_garantisi}</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {d.operator_iptali_ruzgar_25_km} <strong>{d.odediginiz_tutarin_100_iade}</strong>{d.alternatif_olarak_tarih}
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold mt-10 mb-3 text-slate-900">
            {d.saglik_raporu_istisnasi}
          </h2>
          <p className="text-slate-700 leading-relaxed mb-3">
            {d.rezervasyon_sonrasi_ortaya} <strong>{d.resmi_saglik_raporu}</strong> {d.ibraziyla_100_iade_yapilir}
          </p>

          <h2 className="text-2xl font-extrabold mt-10 mb-3 text-slate-900">
            {d.gec_gelme_no_show}
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-900 leading-relaxed">
              {d.bulusma_noktasinda_belirlenen}
            </p>
          </div>

          <h2 className="text-2xl font-extrabold mt-10 mb-3 text-slate-900">
            {d.iade_suresi_yontemi}
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
            <li>{d.iade_onaylandiktan_sonra} <strong>{d["10_is_gunu"]}</strong> {d.icinde_odeme_yapilan_karta_geri}</li>
            <li>{d.bankalarin_iade_yansima_suresi}</li>
            <li>{d.iade_tutari_orijinal_odeme}</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-10 mb-3 text-slate-900">
            {d.iptal_talebi_nasil_yapilir}
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
            <li><strong>{d.eposta_label}</strong> {d.info_tripandtick_com}</li>
            <li><strong>{d.whatsapp_label}</strong> {d["90_537_464_78_61"]}</li>
            <li>{d.talep_onaylanir_onaylanmaz}</li>
          </ul>

          <div className="bg-primary text-white rounded-2xl p-6 mt-10">
            <Check className="w-8 h-8 text-accent mb-3" />
            <h3 className="text-xl font-bold mb-2">{d.adalet_garantisi}</h3>
            <p className="text-white/85 text-sm leading-relaxed">
              {d.iptal_politikamiz_kapadokya}
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
