import type { Metadata } from "next";
import { Cookie, BarChart3, Settings, Megaphone } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Çerez Politikası — Trip and Tick",
  description:
    "Trip and Tick çerez politikası: zorunlu, analitik, fonksiyonel ve pazarlama çerezleri. Çerez yönetimi ve tarayıcı ayarları rehberi.",
  alternates: {
    canonical: `${SITE_URL}/cerez-politikasi`,
    languages: generateHreflang("/cerez-politikasi"),
  },
  openGraph: {
    title: "Çerez Politikası",
    description: "Zorunlu, analitik, fonksiyonel ve pazarlama çerezleri rehberi.",
    url: `${SITE_URL}/cerez-politikasi`,
    type: "website",
    images: [
      {
        url: ogImageUrl("Çerez Politikası", "Zorunlu · Analitik · Pazarlama"),
        width: 1200,
        height: 630,
        alt: "Çerez Politikası — Trip and Tick",
      },
    ],
  },
};

const COOKIE_TYPES = [
  {
    icon: Cookie,
    title: "Zorunlu Çerezler",
    desc: "Sitenin temel işlevselliği için gereklidir. Oturum yönetimi, güvenlik, sepet — bunlar kapatılamaz.",
    examples: ["session_id", "csrf_token", "cookie_consent"],
    color: "bg-slate-100 border-slate-300",
  },
  {
    icon: BarChart3,
    title: "Analitik Çerezler",
    desc: "Site kullanımını anonim ölçer (Google Analytics 4). Hangi sayfalar popüler, hangi noktada kullanıcı ayrılıyor.",
    examples: ["_ga", "_gid", "_ga_*"],
    color: "bg-primary/[0.06] border-primary/20",
  },
  {
    icon: Settings,
    title: "Fonksiyonel Çerezler",
    desc: "Dil seçimi, para birimi, son arama gibi tercihleri hatırlamak için.",
    examples: ["locale", "currency", "recently_viewed"],
    color: "bg-success/[0.06] border-success/30",
  },
  {
    icon: Megaphone,
    title: "Pazarlama Çerezler",
    desc: "Sosyal medya entegrasyonu ve reklam personelizasyonu (sadece onay halinde aktif olur).",
    examples: ["_fbp", "fr", "_gcl_au"],
    color: "bg-accent/[0.06] border-accent/30",
  },
];

export default function CerezPage() {
  return (
    <>
      <PageHero
        tag="Yasal"
        title="Çerez"
        highlight="Politikası"
        description="Trip and Tick çerez kullanımı hakkında şeffaf bilgilendirme. Hangi çerezleri ne için kullanıyoruz, nasıl yönetebilirsiniz."
      />

      <Breadcrumb items={[{ name: "Çerez Politikası", href: "/cerez-politikasi" }]} />

      <article className="section-padding bg-white">
        <div className="container-main max-w-4xl">
          <p className="text-sm text-slate-500 mb-6">
            Yürürlük tarihi: 1 Mayıs 2026 · Son güncelleme: 15 Mayıs 2026
          </p>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-4 mb-3">
            Çerez Nedir?
          </h2>
          <p className="text-slate-700 leading-relaxed mb-6">
            Çerezler (cookies), web siteleri ziyaret edildiğinde tarayıcınızda saklanan
            küçük metin dosyalarıdır. Tercihleri hatırlamak, analitik veri toplamak ve
            kullanıcı deneyimini iyileştirmek için kullanılır.
          </p>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-8 mb-4">
            Kullandığımız Çerez Kategorileri
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {COOKIE_TYPES.map((c) => (
              <div key={c.title} className={`rounded-2xl border-2 p-5 ${c.color}`}>
                <c.icon className="w-8 h-8 text-slate-700 mb-3" />
                <h3 className="font-bold text-slate-900 mb-1.5">{c.title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">{c.desc}</p>
                <div className="text-xs text-slate-500">
                  <strong>Örnekler:</strong>{" "}
                  <code className="text-[11px]">{c.examples.join(", ")}</code>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-10 mb-3">
            Saklama Süreleri
          </h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-6">
            <li><strong>Oturum çerezleri:</strong> tarayıcı kapatıldığında silinir.</li>
            <li><strong>Kalıcı çerezler:</strong> 30 gün ile 24 ay arası.</li>
            <li><strong>Analitik (GA4):</strong> maksimum 14 ay.</li>
            <li><strong>Pazarlama:</strong> 12 ay; onay geri çekildiğinde anında silinir.</li>
          </ul>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-10 mb-3">
            Çerez Yönetimi
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Çerezleri yönetmek için 2 yolunuz var:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-slate-700 mb-6">
            <li>
              <strong>Site içi tercih merkezi:</strong> sayfanın altındaki "Çerez Ayarları"
              linkine tıklayarak kategori bazında onay verin/iptal edin.
            </li>
            <li>
              <strong>Tarayıcı ayarları:</strong> tarayıcınızdan tüm çerezleri silebilir
              veya engelleyebilirsiniz.
            </li>
          </ol>

          <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">
            Tarayıcı Çerez Ayarları Rehberi
          </h3>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-6">
            <li><strong>Google Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler.</li>
            <li><strong>Mozilla Firefox:</strong> Tercihler → Gizlilik ve Güvenlik.</li>
            <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler ve site verisi.</li>
            <li><strong>Microsoft Edge:</strong> Ayarlar → Çerezler ve site izinleri.</li>
          </ul>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <p className="text-sm text-amber-900">
              <strong>Önemli:</strong> Zorunlu çerezleri kapatırsanız site doğru
              çalışmayabilir (örn. ödeme adımı, oturum süresi).
            </p>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-10 mb-3">
            Üçüncü Taraf Çerezleri
          </h2>
          <p className="text-slate-700 leading-relaxed mb-3">
            Bazı çerezler üçüncü taraf servisleri tarafından yerleştirilir:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-6">
            <li>Google Analytics 4 (analitik)</li>
            <li>Stripe (ödeme güvenliği)</li>
            <li>Cloudflare (güvenlik & performans)</li>
            <li>Brevo (e-posta açma takibi)</li>
          </ul>

          <h2 className="text-2xl font-extrabold text-slate-900 mt-10 mb-3">
            Değişiklikler
          </h2>
          <p className="text-slate-700 leading-relaxed mb-6">
            Bu politikayı güncellediğimizde sayfanın üst kısmında yer alan tarih
            değişir. Önemli değişikliklerde aktif kullanıcılara e-posta gönderilir.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-700 mb-2 font-bold">Sorularınız mı var?</p>
            <p className="text-sm text-slate-600">
              info@tripandtick.com adresinden bize ulaşın.
            </p>
          </div>
        </div>
      </article>

      <JsonLd data={breadcrumbSchema([{ name: "Çerez Politikası", href: "/cerez-politikasi" }])} />
    </>
  );
}
