"use client";

import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { useT } from "@/lib/i18n/I18nProvider";

// NEW KEYS (not yet in dict — pending harvest):
// page.kullanim_sartlari.breadcrumb_name = "Kullanım Şartları"
// page.kullanim_sartlari.kvkk_link_text = "KVKK"
// page.kullanim_sartlari.eposta_info = "info@tripandtick.com"

export function KullanimSartlariContent() {
  const t = useT();
  const d = t.page.kullanim_sartlari;

  return (
    <>
      <PageHero
        tag="Yasal"
        title={d.pagehero_title_kullanim}
        highlight={d.pagehero_highlight_sartlari}
        description={d.pagehero_description_trip_tick}
      />

      {/* NEW: breadcrumb_name */}
      <Breadcrumb items={[{ name: "Kullanım Şartları", href: "/kullanim-sartlari" }]} />

      <article className="section-padding bg-white">
        <div className="container-main max-w-4xl">
          <p className="text-sm text-slate-500 mb-6">
            {d.yururluk_tarihi_mayis_2026_son}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.taraflar}</h2>
          <p className="text-slate-700 mb-3">
            {d.satici} <strong>{d.trip_tick_turizm_seyahat}</strong>{" "}
            {d.bundan_sonra_trip_tick_adres}
          </p>
          <p className="text-slate-700 mb-4">
            {d.alici_tripandtick_com_uzerinden}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.hizmet_kapsami}</h2>
          <p className="text-slate-700 mb-4">
            {d.trip_tick_balon_turu_otel}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.fiyatlandirma_para_birimleri}</h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>{d.fiyatlar_eur_usd_try_cinsinden}</li>
            <li>{d.tum_vergiler_kdv_dahil_fiyata}</li>
            <li>{d.cocuk_indirimi_12_yas_arasi}</li>
            <li>{d.yuksek_sezon_nisan_haziran_eylul}</li>
            <li>{d.en_dusuk_fiyat_garantisi_daha}</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.odeme}</h2>
          <p className="text-slate-700 mb-4">
            {d.odeme_visa_mastercard_american}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.iptal_iade}</h2>
          <p className="text-slate-700 mb-4">
            {d.iptal_politikamizin_tam_metni}{" "}
            <Link href="/iptal-iade-politikasi" className="text-accent font-semibold hover:underline">
              {d.iptal_iade_politikasi}
            </Link>{" "}
            {d.sayfasina_bakin_ozet_72_saat}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.musteri_yukumlulukleri}</h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>{d.dogru_ad_dogum_tarihi_iletisim}</li>
            <li>{d.hamilelik_ciddi_saglik_sorunu}</li>
            <li>{d.yas_kilo_limitlerine_uymak_balon}</li>
            <li>{d.bulusma_saatinde_hazir_olmak}</li>
            <li>{d.operator_guvenlik_kurallarina}</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.sorumluluk_reddi}</h2>
          <p className="text-slate-700 mb-4">
            {d.trip_tick_hizmeti_fiilen_sunan}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.fikri_mulkiyet}</h2>
          <p className="text-slate-700 mb-4">
            {d.site_icerigi_metin_gorsel_kod}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.tuketici_haklari}</h2>
          <p className="text-slate-700 mb-4">
            {d["6502_sayili_tuketicinin"]}{" "}
            {/* NEW: kvkk_link_text */}
            <Link href="/kvkk" className="text-accent font-semibold hover:underline">
              KVKK
            </Link>{" "}
            {d.sayfamiza_bakin}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d["10_uyusmazlik_cozumu"]}</h2>
          <p className="text-slate-700 mb-4">
            {d.uyusmazlik_halinde_oncelikle}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d["11_degisiklikler"]}</h2>
          <p className="text-slate-700 mb-4">
            {d.trip_tick_sartlari_zaman_zaman}
          </p>

          <div className="mt-10 bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-700 mb-2 font-bold">{d.iletisim}</p>
            <p className="text-sm text-slate-600">
              {d.sorulariniz}{" "}
              {/* NEW: eposta_info */}
              <a href="mailto:info@tripandtick.com" className="text-accent font-semibold">
                info@tripandtick.com
              </a>
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
