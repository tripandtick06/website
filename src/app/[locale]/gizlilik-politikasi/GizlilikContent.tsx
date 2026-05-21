"use client";
import { useT } from "@/lib/i18n/I18nProvider";
import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";

export function GizlilikContent() {
  const t = useT();
  const g = t.page.gizlilik_politikasi;
  return (
    <>
      <PageHero
        tag={g.tag_yasal}
        title={g.pagehero_title_gizlilik}
        highlight={g.pagehero_highlight_politikasi}
        description={g.pagehero_description_kisisel}
      />

      <Breadcrumb
        items={[{ name: g.breadcrumb_gizlilik_politikasi, href: "/gizlilik-politikasi" }]}
      />

      <article className="section-padding bg-white">
        <div className="container-main max-w-4xl">
          <p className="text-sm text-slate-500 mb-6">
            {g.yururluk_tarihi_mayis_2026_son}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{g.veri_sorumlusu}</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            {g.trip_tick_trip_tick_turizm}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{g.toplanan_kisisel_veriler}</h2>
          <p className="text-slate-700 mb-3">{g.asagidaki_veri_kategorilerini}</p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>
              <strong>{g.kimlik_label}</strong> {g.ad_soyad_dogum_tarihi_yas}
            </li>
            <li>
              <strong>{g.iletisim}</strong> {g.posta_adresi_telefon_numarasi}
            </li>
            <li>
              <strong>{g.pasaport_label}</strong> {g.uluslararasi_ucus_misafirleri}
            </li>
            <li>
              <strong>{g.finansal_label}</strong> {g.odeme_tutari_para_birimi_kart}
            </li>
            <li>
              <strong>{g.islem}</strong> {g.rezervasyon_gecmisi_tercihler}
            </li>
            <li>
              <strong>{g.teknik_label}</strong> {g.ip_tarayici_cihaz_cerez_verisi}
            </li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{g.isleme_amaclari}</h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>{g.rezervasyon_isleme_operatore}</li>
            <li>{g.odeme_fatura_islemleri_vergi}</li>
            <li>{g.musteri_destegi_sikayet_yonetimi}</li>
            <li>{g.pazarlama_iletisimi_sadece_acik}</li>
            <li>{g.yasal_yukumluluklerin_yerine}</li>
            <li>{g.hizmet_iyilestirme_anonim}</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{g.veri_paylasimi}</h2>
          <p className="text-slate-700 mb-3">{g.veriler_asagidaki_taraflarla}</p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>
              <strong>{g.operatorler}</strong> {g.rezervasyon_yaptiginiz_operator}
            </li>
            <li>
              <strong>{g.odeme_saglayicisi}</strong> {g.stripe_pci_dss_uyumlu}
            </li>
            <li>
              <strong>{g.posta_servisi}</strong> {g.brevo_transactional_marketing}
            </li>
            <li>
              <strong>{g.resmi_makamlar}</strong> {g.yasal_talep_halinde_tursab_gelir}
            </li>
          </ul>
          <p className="text-slate-700 mb-4">{g.verileriniz_pazarlama_amaciyla}</p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{g.saklama_sureleri}</h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>{g.rezervasyon_fatura_verileri_10}</li>
            <li>{g.pazarlama_izni_iptal_edilene}</li>
            <li>{g.sozlesmesiz_iletisim_yil}</li>
            <li>{g.cerez_verisi_12_aya_kadar}</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{g.kullanici_haklari_kvkk_11}</h2>
          <p className="text-slate-700 mb-3">{g.kvkk_kapsaminda_asagidaki}</p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>{g.kisisel_verilerinizin_islenip}</li>
            <li>{g.islenmisse_buna_iliskin_bilgi}</li>
            <li>{g.isleme_amacini_uygunlugunu}</li>
            <li>{g.yurt_ici_disi_aktarilan}</li>
            <li>{g.eksik_yanlis_islenmisse}</li>
            <li>{g.silinmesini_yok_edilmesini}</li>
            <li>{g.isleme_aktarildigi_taraflara}</li>
            <li>{g.otomatik_sistemlerle_cikan}</li>
            <li>{g.zarar_olustuysa_giderilmesini}</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{g.basvuru}</h2>
          <p className="text-slate-700 mb-4">
            {g.haklarinizi_kullanmak_info}{" "}
            <strong>{g["30_gun_icinde"]}</strong> {g.ucretsiz_olarak_yanitlayacagiz}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{g.guvenlik}</h2>
          <p className="text-slate-700 mb-4">{g.veriler_https_sifreli_iletisim}</p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{g.cerezler}</h2>
          <p className="text-slate-700 mb-4">
            {g.sitemiz_cerez_kullanir_detay}{" "}
            <Link href="/cerez-politikasi" className="text-accent font-semibold hover:underline">
              {g.cerez_politikasi}
            </Link>{" "}
            {g.sayfamiza_bakin}
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">{g["10_degisiklikler"]}</h2>
          <p className="text-slate-700 mb-4">{g.politikayi_zaman_zaman}</p>

          <div className="mt-10 bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-700 mb-2 font-bold">{g.iletisim_2}</p>
            <p className="text-sm text-slate-600">
              {g.sorulariniz}{" "}
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
