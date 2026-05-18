import type { Metadata } from "next";
import { GdprForm } from "./GdprForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { SITE_URL } from "@/lib/schema";
import { generateHreflang } from "@/lib/hreflang";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Verilerinizi Yönetin (GDPR/KVKK) — Trip and Tick",
  description:
    "Kişisel verilerinize erişin (GDPR Madde 15) veya silinmesini talep edin (GDPR Madde 17). 24 saatlik onaylı magic-link ile güvenli işlem.",
  alternates: {
    canonical: `${SITE_URL}/gdpr`,
    languages: generateHreflang("/gdpr"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function GdprPage() {
  return (
    <>
      <PageHero
        tag="Veri Hakları"
        title="Verilerinizi Yönetin"
        description="GDPR Madde 15 (erişim) ve Madde 17 (silme) haklarınızı kullanın. Kayıtlı e-posta adresinize 24 saatlik onaylı bağ göndereceğiz."
      />

      <Breadcrumb items={[{ name: "Veri Hakları (GDPR/KVKK)", href: "/gdpr" }]} />

      <section className="section-padding">
        <div className="container-main max-w-2xl">
          <div className="card p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Talep Formu</h2>
            <p className="text-slate-600 mb-6">
              Aşağıdaki forma e-posta adresinizi girin ve yapmak istediğiniz işlemi seçin. Onaylı bağ posta kutunuza gönderilecek. Bağ <strong>24 saat</strong> geçerlidir.
            </p>
            <GdprForm />
          </div>

          <div className="mt-8 space-y-4 text-sm text-slate-600">
            <h3 className="text-lg font-semibold text-slate-900">Neyi indirebilirim?</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Müşteri profil bilgileriniz (ad, e-posta, telefon, dil tercihi).</li>
              <li>Tüm rezervasyon kayıtlarınız (tarih, paket, fiyat, yolcu detayları).</li>
              <li>Sadakat puan geçmişiniz (varsa).</li>
            </ul>
            <p className="text-xs text-slate-500">
              Stripe ödeme kayıtları finansal kanıt zinciri için Stripe altyapısında saklanır; talep üzerine{" "}
              <a href="mailto:hello@tripandtick.com" className="text-primary underline">
                hello@tripandtick.com
              </a>{" "}
              ile sağlanır.
            </p>

            <h3 className="text-lg font-semibold text-slate-900 mt-6">Silme talep ettiğimde ne olur?</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Müşteri profiliniz silinir.</li>
              <li>Rezervasyon yolcu bilgileri (ad, e-posta, telefon) anonimleştirilir.</li>
              <li>Newsletter aboneliğiniz iptal edilir (Brevo).</li>
              <li>Vergi mevzuatı (213 VUK) gereği fatura kayıtları 10 yıl saklanır; talep üzerine süre sonunda silinir.</li>
            </ul>

            <p className="text-xs text-slate-500 mt-4">
              KVKK Veri Sorumlusu: Trip and Tick · Nevşehir/Kapadokya · İletişim:{" "}
              <a href="mailto:hello@tripandtick.com" className="text-primary underline">
                hello@tripandtick.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
