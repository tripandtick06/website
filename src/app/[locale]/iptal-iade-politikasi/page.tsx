import type { Metadata } from "next";
import { Shield, Clock, Check, AlertTriangle } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "İptal & İade Politikası — %100 İade Garantisi | Trip and Tick",
  description:
    "Trip and Tick iptal & iade politikası: 72+ saat öncesi %100 iade, hava iptali her zaman tam iade. 5-10 iş günü içinde geri ödeme.",
  alternates: {
    canonical: `${SITE_URL}/iptal-iade-politikasi`,
    languages: generateHreflang("/iptal-iade-politikasi"),
  },
  openGraph: {
    title: "İptal & İade Politikası",
    description: "72+ saat öncesi %100 iade, hava iptali her zaman tam iade.",
    url: `${SITE_URL}/iptal-iade-politikasi`,
    type: "website",
    images: [
      {
        url: ogImageUrl(
          "İptal & İade Politikası",
          "%100 İade Garantisi · 72 Saat Kuralı"
        ),
        width: 1200,
        height: 630,
        alt: "İptal & İade — Trip and Tick",
      },
    ],
  },
};

const POLICY_ROWS = [
  { time: "72+ saat önce", refund: "%100 iade", color: "text-success", bg: "bg-success/[0.06]" },
  { time: "24-72 saat önce", refund: "%50 iade", color: "text-warning", bg: "bg-warning/[0.06]" },
  { time: "24 saatten az", refund: "İade yok", color: "text-danger", bg: "bg-danger/[0.06]" },
  { time: "Operatör/hava iptali", refund: "%100 iade veya alt. tarih", color: "text-success", bg: "bg-success/[0.06]" },
  { time: "Sağlık raporu", refund: "%100 iade", color: "text-success", bg: "bg-success/[0.06]" },
];

export default function IptalIadePage() {
  return (
    <>
      <PageHero
        tag="Yasal"
        title="İptal &"
        highlight="İade Politikası"
        description="Adil, şeffaf ve yasal mevzuata uyumlu iptal politikası. Hava kaynaklı iptallerde her zaman %100 iade garantisi."
      />

      <Breadcrumb items={[{ name: "İptal & İade", href: "/iptal-iade-politikasi" }]} />

      <article className="section-padding bg-white">
        <div className="container-main max-w-4xl">
          <p className="text-sm text-slate-500 mb-6">
            Yürürlük tarihi: 1 Mayıs 2026 · Son güncelleme: 15 Mayıs 2026
          </p>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-accent" />
            İptal Süresi & İade Tablosu
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 mb-10">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left py-3 px-4 font-bold text-slate-900">İptal Zamanı</th>
                  <th className="text-left py-3 px-4 font-bold text-slate-900">İade Tutarı</th>
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
            1. Müşteri Kaynaklı İptal
          </h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Plan değişikliği, kişisel nedenler veya başka herhangi bir sebeple
            rezervasyonunuzu iptal etmek istiyorsanız aşağıdaki kurallar uygulanır:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
            <li><strong>72 saat ve daha öncesinden iptal:</strong> Ödediğiniz tutarın %100'ü iade edilir.</li>
            <li><strong>24 ile 72 saat arası iptal:</strong> Ödediğiniz tutarın %50'si iade edilir.</li>
            <li><strong>24 saatten az iptal:</strong> İade hakkı yoktur. (Sağlık raporu istisnası için aşağıya bakın.)</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-10 mb-3 text-slate-900">
            2. Hava ve Operatör Kaynaklı İptal
          </h2>
          <div className="bg-success/[0.06] border border-success/20 rounded-2xl p-5 mb-6">
            <div className="flex gap-3">
              <Shield className="w-6 h-6 text-success flex-shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 mb-2">%100 İade Garantisi</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Operatör iptali (rüzgar &gt;25 km/sa, görüş azalması, yağış, teknik
                  arıza vb.) durumunda iptal sizden değil bizden kaynaklandığı için
                  ödediğiniz tutarın <strong>%100'ü iade edilir</strong>. Alternatif
                  olarak tarih değişikliği yapılabilir; bu durumda ek ücret alınmaz.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold mt-10 mb-3 text-slate-900">
            3. Sağlık Raporu İstisnası
          </h2>
          <p className="text-slate-700 leading-relaxed mb-3">
            Rezervasyon sonrası ortaya çıkan hastalık, kaza veya hamilelik gibi
            durumlarda <strong>resmi sağlık raporu</strong> ibrazıyla %100 iade yapılır.
            Raporun rezervasyon tarihinden sonra düzenlenmiş olması gerekir.
          </p>

          <h2 className="text-2xl font-extrabold mt-10 mb-3 text-slate-900">
            4. Geç Gelme / No-Show
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-900 leading-relaxed">
              Buluşma noktasında belirlenen saatte hazır olmamanız durumunda iade hakkı
              yoktur. Otelden transfer alma saatini en az 24 saat önceden onaylamanızı
              öneririz.
            </p>
          </div>

          <h2 className="text-2xl font-extrabold mt-10 mb-3 text-slate-900">
            5. İade Süresi & Yöntemi
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
            <li>İade onaylandıktan sonra <strong>5-10 iş günü</strong> içinde ödeme yapılan karta geri yatırılır.</li>
            <li>Bankaların iade yansıma süresi 2-7 iş günü daha sürebilir.</li>
            <li>İade tutarı orijinal ödeme yöntemine yapılır; başka karta aktarılamaz.</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-10 mb-3 text-slate-900">
            6. İptal Talebi Nasıl Yapılır?
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
            <li><strong>E-posta:</strong> info@tripandtick.com — rezervasyon no + iptal sebebi.</li>
            <li><strong>WhatsApp:</strong> +90 500 123 45 67 — anlık talep.</li>
            <li>Talep onaylanır onaylanmaz e-posta ile bildirilir.</li>
          </ul>

          <div className="bg-primary text-white rounded-2xl p-6 mt-10">
            <Check className="w-8 h-8 text-accent mb-3" />
            <h3 className="text-xl font-bold mb-2">Adalet Garantisi</h3>
            <p className="text-white/85 text-sm leading-relaxed">
              İptal politikamız Kapadokya'daki en şeffaf politikalardan biridir. Hava
              kaynaklı iptallerde komisyon kesintisi yapılmaz, %100 iade verilir. Tek
              istisna 24 saatten az iptaldir — bu da operatör tarafının iş gücü
              maliyetini koruma amaçlıdır.
            </p>
          </div>
        </div>
      </article>

      <JsonLd data={breadcrumbSchema([{ name: "İptal & İade", href: "/iptal-iade-politikasi" }])} />
    </>
  );
}
