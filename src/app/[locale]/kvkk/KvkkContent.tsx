"use client";

import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { useT } from "@/lib/i18n/I18nProvider";


export function KvkkContent() {
  const t = useT();
  const d = t.page.kvkk;

  return (
    <>
      <PageHero
        tag={d.pagehero_tag_yasal}
        title={d.pagehero_title_kvkk}
        highlight={d.pagehero_highlight_aydinlatma_metni}
        description={d.pagehero_description_6698_sayili}
      />

      <Breadcrumb items={[{ name: "KVKK", href: "/kvkk" }]} />

      <article className="section-padding bg-white">
        <div className="container-main max-w-4xl">
          <p className="text-sm text-slate-500 mb-6">
            {d.yururluk_tarihi_mayis_2026_son}
          </p>

          <h2 className="text-2xl font-extrabold mt-4 mb-3">{d.veri_sorumlusu}</h2>
          <p className="text-slate-700 mb-3">
            {d["6698_sayili_kisisel_verilerin"]}{" "}
            <strong>{d.trip_tick_turizm_seyahat}</strong>{" "}
            {d.olarak_kisisel_verilerin}
          </p>
          <p className="text-slate-700 mb-4">
            <strong>{d.adres_label}</strong> {d.goreme_merkez_nevsehir_50180}<br />
            <strong>{d.eposta_label}</strong> {d.eposta_info}<br />
            <strong>{d.telefon_label}</strong> {d.telefon_no}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            {d.kisisel_verilerin_islenme}
          </h2>
          <p className="text-slate-700 mb-3">{d.kisisel_verileriniz_asagidaki}</p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>{d.mesafeli_satis_sozlesmesinin}</li>
            <li>{d.rezervasyon_isleme_odeme}</li>
            <li>{d.operatore_rezervasyon_bildirimi}</li>
            <li>{d.musteri_destegi_sikayet_talep}</li>
            <li>{d.yasal_yukumluluklerin_yerine}</li>
            <li>{d.pazarlama_iletisimi_yalnizca}</li>
            <li>{d.hizmet_kalitesinin}</li>
            <li>{d.veri_guvenligi_dolandiricilik}</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            {d.isleme_hukuki_sebepleri_kvkk}
          </h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>{d.sozlesmenin_kurulmasi_ifasi}</li>
            <li>{d.hukuki_yukumlulugun_yerine}</li>
            <li>{d.veri_sorumlusunun_mesru}</li>
            <li>{d.acik_riza_pazarlama_amacli}</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            {d.kisisel_verilerin_aktarimi}
          </h2>
          <p className="text-slate-700 mb-3">
            {d.verileriniz_asagidaki_alici}
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>{d.anlasmali_operatorler}</li>
            <li>{d.odeme_saglayicisi_stripe_pci_dss}</li>
            <li>{d.posta_servisi_brevo_yurt_ici}</li>
            <li>{d.yetkili_kamu_kurumlari_yasal}</li>
            <li>{d.hukuki_danismanlar_mali}</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.saklama_sureleri}</h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>{d.sozlesme_iliskisi_devam_ettigi}</li>
            <li>{d.vergi_mevzuati_kapsamindaki}</li>
            <li>{d.pazarlama_amacli_kayitlar_riza}</li>
            <li>{d.cerez_verisi_12_aya_kadar}</li>
            <li>{d.yasal_saklama_suresi_sonunda}</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            {d.veri_sahibinin_haklari_kvkk_11}
          </h2>
          <p className="text-slate-700 mb-3">{d.veri_sahibi_sifatiyla_asagidaki}</p>
          <ol className="list-decimal pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>{d.kisisel_veri_islenip}</li>
            <li>{d.kisisel_verileriniz_islenmisse}</li>
            <li>{d.isleme_amacini_amaca_uygun}</li>
            <li>{d.yurt_ici_disinda_verilerin}</li>
            <li>{d.eksik_yanlis_islenmisse}</li>
            <li>{d.kvkk_ongorulen_sartlar}</li>
            <li>{d.bentleri_uyarinca_yapilan}</li>
            <li>{d.otomatik_sistemlerle_analiz}</li>
            <li>{d.hukuka_aykiri_isleme_sebebiyle}</li>
          </ol>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.basvuru_yontemleri}</h2>
          <p className="text-slate-700 mb-3">
            {d.kvkk_13_kapsaminda_haklarinizi}
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>
              <strong>{d.online_onerilir_label}</strong>{" "}
              <Link href="/gdpr" className="text-accent font-semibold">
                {d.veri_haklari_talep_formu}
              </Link>
              {" "}{d.magic_link_aciklama}
            </li>
            <li>
              <strong>{d.eposta_label}</strong>{" "}
              <a href="mailto:info@tripandtick.com" className="text-accent font-semibold">
                {d.eposta_info}
              </a>
            </li>
            <li><strong>{d.posta_label}</strong> {d.goreme_merkez_nevsehir_50180_2}</li>
            <li><strong>{d.noter_ihtarnamesi}</strong> {d.resmi_kayitli_yontem}</li>
          </ul>
          <p className="text-slate-700 mb-4">
            {d.basvurunuz} <strong>{d.en_gec_30_gun_icinde}</strong> {d.ucretsiz_olarak_yanitlanir}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{d.sikayet_hakki}</h2>
          <p className="text-slate-700 mb-3">
            {d.basvurunuzun_reddedilmesi}
          </p>
          <p className="text-slate-700 mb-4">
            <strong>{d.kisisel_verileri_koruma_kurumu}</strong>{" "}
            <a
              href="https://www.kvkk.gov.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent font-semibold"
            >
              {d.kvkk_gov_url_text}
            </a>
          </p>

          <div className="mt-10 bg-primary text-white rounded-2xl p-6">
            <p className="font-bold mb-2">{d.bilgi_notu}</p>
            <p className="text-sm text-white/90 leading-relaxed">
              {d.aydinlatma_metni_kvkk}{" "}
              <Link href="/gizlilik-politikasi" className="text-accent font-semibold underline">
                {d.gizlilik_politikasi}
              </Link>{" "}
              {d.sayfamiza_bakabilirsiniz}
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
