"use client";
import { Cookie, BarChart3, Settings, Megaphone } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";

export function CerezContent() {
  const t = useT();
  const cp = t.page.cerez_politikasi;

  const COOKIE_TYPES = [
    {
      icon: Cookie,
      title: cp.cookie_type_zorunlu_title,
      desc: cp.cookie_type_zorunlu_desc,
      examples: ["session_id", "csrf_token", "cookie_consent"],
      color: "bg-slate-100 border-slate-300",
    },
    {
      icon: BarChart3,
      title: cp.cookie_type_analitik_title,
      desc: cp.cookie_type_analitik_desc,
      examples: ["_ga", "_gid", "_ga_*"],
      color: "bg-primary/[0.06] border-primary/20",
    },
    {
      icon: Settings,
      title: cp.cookie_type_fonksiyonel_title,
      desc: cp.cookie_type_fonksiyonel_desc,
      examples: ["locale", "currency", "recently_viewed"],
      color: "bg-success/[0.06] border-success/30",
    },
    {
      icon: Megaphone,
      title: cp.cookie_type_pazarlama_title,
      desc: cp.cookie_type_pazarlama_desc,
      examples: ["_fbp", "fr", "_gcl_au"],
      color: "bg-accent/[0.06] border-accent/30",
    },
  ];

  return (
    <>
      <PageHero
        tag={cp.tag_yasal}
        title={cp.pagehero_title_cerez}
        highlight={cp.pagehero_highlight_politikasi}
        description={cp.pagehero_description_trip_tick}
      />

      <Breadcrumb
        items={[{ name: cp.breadcrumb_cerez_politikasi, href: "/cerez-politikasi" }]}
      />

      <article className="section-padding bg-white">
        <div className="container-main max-w-4xl">
          <p className="text-sm text-slate-500 mb-6">
            {cp.yururluk_tarihi_mayis_2026_son}
          </p>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-4 mb-3">
            {cp.cerez_nedir}
          </h2>
          <p className="text-slate-700 leading-relaxed mb-6">
            {cp.cerezler_cookies_web_siteleri}
          </p>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-8 mb-4">
            {cp.kullandigimiz_cerez_kategorileri}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {COOKIE_TYPES.map((item) => (
              <div key={item.title} className={`rounded-2xl border-2 p-5 ${item.color}`}>
                <item.icon className="w-8 h-8 text-slate-700 mb-3" />
                <h3 className="font-bold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">{item.desc}</p>
                <div className="text-xs text-slate-500">
                  <strong>{cp.ornekler}</strong>{" "}
                  <code className="text-[11px]">{item.examples.join(", ")}</code>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-10 mb-3">
            {cp.saklama_sureleri}
          </h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-6">
            <li>
              <strong>{cp.oturum_cerezleri}</strong> {cp.tarayici_kapatildiginda_silinir}
            </li>
            <li>
              <strong>{cp.kalici_cerezler}</strong> {cp["30_gun_24_ay_arasi"]}
            </li>
            <li>
              <strong>{cp.analitik_ga4}</strong> {cp.maksimum_14_ay}
            </li>
            <li>
              <strong>{cp.pazarlama_label}</strong> {cp["12_ay_onay_geri_cekildiginde"]}
            </li>
          </ul>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-10 mb-3">
            {cp.cerez_yonetimi}
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            {cp.cerezleri_yonetmek_yolunuz_var}
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-slate-700 mb-6">
            <li>
              <strong>{cp.site_ici_tercih_merkezi}</strong> {cp.sayfanin_altindaki_cerez}
            </li>
            <li>
              <strong>{cp.tarayici_ayarlari}</strong> {cp.tarayicinizdan_tum_cerezleri}
            </li>
          </ol>

          <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">
            {cp.tarayici_cerez_ayarlari_rehberi}
          </h3>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-6">
            <li>
              <strong>{cp.google_chrome}</strong> {cp.ayarlar_gizlilik_guvenlik}
            </li>
            <li>
              <strong>{cp.mozilla_firefox}</strong> {cp.tercihler_gizlilik_guvenlik}
            </li>
            <li>
              <strong>Safari:</strong> {cp.tercihler_gizlilik_cerezler}
            </li>
            <li>
              <strong>{cp.microsoft_edge}</strong> {cp.ayarlar_cerezler_site_izinleri}
            </li>
          </ul>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <p className="text-sm text-amber-900">
              <strong>{cp.onemli}</strong> {cp.zorunlu_cerezleri_kapatirsaniz}
            </p>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-10 mb-3">
            {cp.ucuncu_taraf_cerezleri}
          </h2>
          <p className="text-slate-700 leading-relaxed mb-3">
            {cp.bazi_cerezler_ucuncu_taraf}
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-6">
            <li>{cp.google_analytics_analitik}</li>
            <li>{cp.stripe_odeme_guvenligi}</li>
            <li>{cp.cloudflare_guvenlik_performans}</li>
            <li>{cp.brevo_posta_acma_takibi}</li>
          </ul>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-10 mb-3">
            {cp.degisiklikler}
          </h2>
          <p className="text-slate-700 leading-relaxed mb-6">
            {cp.politikayi_guncelledigimizde}
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-700 mb-2 font-bold">{cp.sorulariniz_var}</p>
            <p className="text-sm text-slate-600">{cp.info_tripandtick_com_adresinden}</p>
          </div>
        </div>
      </article>
    </>
  );
}
