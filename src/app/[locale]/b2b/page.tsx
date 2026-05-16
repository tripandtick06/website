// B2B acente landing — basvuru formu + giris linki + avantajlar.
//
// Importers: Next.js App Router auto-route /b2b. Linkler:
//   - Footer.tsx "B2B Acente" → /b2b
//   - /b2b/login (mevcut acenteler)
// Affected: yeni public landing sayfasi B2B kanali tanitir.
// Data: form POST → /api/b2b/apply (Brevo mail).
// User verbatim: "B2B landing: PageHero, Avantajlar (toplu fiyat, API, destek,
// %15+ komisyon), Basvur form (email + sirket + telefon + ulke + lisans),
// B2B Giris link /b2b/login."

import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";
import { B2BApplyForm } from "@/components/b2b/B2BApplyForm";
import { Tag, Code2, Headphones, Percent, LogIn, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "B2B Acente Programı — Toplu Fiyat & API | Trip and Tick",
  description:
    "Seyahat acenteleri için B2B programı: %12-18 komisyon, REST API erişimi, özel hesap yöneticisi, kredi limiti, çoklu para birimi.",
  alternates: {
    canonical: `${SITE_URL}/b2b`,
    languages: generateHreflang("/b2b"),
  },
  openGraph: {
    title: "Trip and Tick B2B Acente Programı",
    description: "Toplu fiyat · REST API · %12-18 komisyon · Özel destek.",
    url: `${SITE_URL}/b2b`,
    type: "website",
    images: [
      {
        url: ogImageUrl(
          "B2B Acente Programı",
          "Toplu Fiyat · API Erişimi · %12-18 Komisyon"
        ),
        width: 1200,
        height: 630,
        alt: "Trip and Tick B2B Acente Programı",
      },
    ],
  },
};

const BENEFITS = [
  {
    icon: Tag,
    title: "Toplu Fiyat",
    desc: "Tüm balon, tur, otel ve transfer envanterinde rekabetçi net fiyat. Volüm bazlı ek indirim.",
  },
  {
    icon: Code2,
    title: "REST API Erişimi",
    desc: "Müsaitlik sorgu, rezervasyon oluşturma, iptal — JSON API ile sisteminize entegre.",
  },
  {
    icon: Headphones,
    title: "Özel Hesap Yöneticisi",
    desc: "Türkçe + İngilizce + Almanca destek. 7/24 WhatsApp + öncelikli e-posta yanıt.",
  },
  {
    icon: Percent,
    title: "%12-18 Komisyon",
    desc: "Volüm + sezon bazlı dinamik komisyon. Aylık otomatik mutabakat raporu.",
  },
];

export default function B2BPage() {
  return (
    <>
      <PageHero
        tag="Acente Programı"
        title="B2B Acente"
        highlight="Programı"
        description="Seyahat acenteleri ve tur operatörleri için özel komisyon, REST API erişimi ve kredi limiti. 50+ ülkeden 200+ partner acente."
      />

      <Breadcrumb items={[{ name: "B2B", href: "/b2b" }]} />

      {/* Avantajlar */}
      <section className="section-padding">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              Neden Trip and Tick B2B?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Kapadokya envanterinde en güçlü partner ağıyla acenteniz için maksimum kâr marjı.
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
              Acente Başvuru Formu
            </h2>
            <p className="text-slate-600 mb-6">
              Başvurunuzu 24 saat içinde inceleyip API key ve ön onay belgesini
              e-posta ile iletiyoruz. Lisans belgesi sonradan yüklenebilir.
            </p>
            <B2BApplyForm />
          </div>

          {/* Mevcut acente giris (2 col) */}
          <aside className="lg:col-span-2">
            <div className="bg-slate-900 text-white rounded-2xl p-7 sticky top-24">
              <LogIn className="w-8 h-8 text-accent mb-3" />
              <h3 className="text-xl font-extrabold mb-2">Zaten acente misiniz?</h3>
              <p className="text-slate-300 text-sm mb-5">
                Dashboard&apos;a giriş yapıp rezervasyonlarınızı yönetin, API key
                ve fatura raporlarınıza erişin.
              </p>
              <Link
                href="/b2b/login"
                className="inline-flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-light text-white font-semibold py-3 rounded-xl transition-colors"
              >
                B2B Giriş
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="mt-6 pt-5 border-t border-slate-800 text-xs text-slate-400">
                <p className="mb-1">
                  <span className="text-slate-200 font-semibold">Demo:</span> acente@example.com
                </p>
                <p>
                  <span className="text-slate-200 font-semibold">API Key:</span>{" "}
                  <code className="bg-slate-800 px-1.5 py-0.5 rounded">tt_b2b_demo123</code>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <JsonLd data={breadcrumbSchema([{ name: "B2B", href: "/b2b" }])} />
    </>
  );
}
