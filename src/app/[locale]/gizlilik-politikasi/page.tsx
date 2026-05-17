import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";

export const runtime = "edge";


export const metadata: Metadata = {
  title: "Gizlilik Politikası — KVKK Uyumlu | Trip and Tick",
  description:
    "Trip and Tick gizlilik politikası: kişisel verilerin toplanması, kullanımı, saklanması ve kullanıcı hakları. KVKK ve GDPR uyumlu işleme.",
  alternates: {
    canonical: `${SITE_URL}/gizlilik-politikasi`,
    languages: generateHreflang("/gizlilik-politikasi"),
  },
  openGraph: {
    title: "Gizlilik Politikası — KVKK Uyumlu",
    description: "KVKK ve GDPR uyumlu veri işleme politikamız.",
    url: `${SITE_URL}/gizlilik-politikasi`,
    type: "website",
    images: [
      {
        url: ogImageUrl("Gizlilik Politikası", "KVKK & GDPR Uyumlu"),
        width: 1200,
        height: 630,
        alt: "Gizlilik Politikası — Trip and Tick",
      },
    ],
  },
};

export default function GizlilikPage() {
  return (
    <>
      <PageHero
        tag="Yasal"
        title="Gizlilik"
        highlight="Politikası"
        description="Kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuz hakkında şeffaf bilgilendirme. KVKK (6698) ve GDPR uyumlu."
      />

      <Breadcrumb items={[{ name: "Gizlilik Politikası", href: "/gizlilik-politikasi" }]} />

      <article className="section-padding bg-white">
        <div className="container-main max-w-4xl">
          <p className="text-sm text-slate-500 mb-6">
            Yürürlük tarihi: 1 Mayıs 2026 · Son güncelleme: 15 Mayıs 2026
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">1. Veri Sorumlusu</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Trip and Tick (Trip and Tick Turizm ve Seyahat Acentası Limited Şirketi),
            6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri
            sorumlusudur. Adresimiz: Göreme Merkez, Nevşehir 50180, Türkiye.
            İletişim: info@tripandtick.com.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">2. Toplanan Kişisel Veriler</h2>
          <p className="text-slate-700 mb-3">Aşağıdaki veri kategorilerini topluyoruz:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li><strong>Kimlik:</strong> ad, soyad, doğum tarihi (yaş kontrolü), uyruk.</li>
            <li><strong>İletişim:</strong> e-posta adresi, telefon numarası, otel adresi.</li>
            <li><strong>Pasaport:</strong> uluslararası uçuş misafirleri için pasaport numarası.</li>
            <li><strong>Finansal:</strong> ödeme tutarı, para birimi. Kart bilgileri Trip and Tick'te saklanmaz — Stripe altyapısı kullanılır.</li>
            <li><strong>İşlem:</strong> rezervasyon geçmişi, tercihler, özel istekler.</li>
            <li><strong>Teknik:</strong> IP, tarayıcı, cihaz, çerez verisi.</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">3. İşleme Amaçları</h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>Rezervasyon işleme ve operatöre bildirim.</li>
            <li>Ödeme ve fatura işlemleri (vergi mevzuatı).</li>
            <li>Müşteri desteği ve şikayet yönetimi.</li>
            <li>Pazarlama iletişimi (sadece açık onay halinde).</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (TÜRSAB, vergi).</li>
            <li>Hizmet iyileştirme, anonim analitik.</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">4. Veri Paylaşımı</h2>
          <p className="text-slate-700 mb-3">Veriler aşağıdaki taraflarla paylaşılır:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li><strong>Operatörler:</strong> rezervasyon yaptığınız operatör (sadece o rezervasyon için gerekli minimum bilgi).</li>
            <li><strong>Ödeme sağlayıcısı:</strong> Stripe (PCI-DSS uyumlu).</li>
            <li><strong>E-posta servisi:</strong> Brevo (transactional + marketing).</li>
            <li><strong>Resmi makamlar:</strong> yasal talep halinde TÜRSAB, Gelir İdaresi, mahkemeler.</li>
          </ul>
          <p className="text-slate-700 mb-4">
            Verileriniz pazarlama amacıyla üçüncü taraflara satılmaz veya kiralanmaz.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">5. Saklama Süreleri</h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>Rezervasyon ve fatura verileri: 10 yıl (vergi mevzuatı).</li>
            <li>Pazarlama izni: iptal edilene kadar.</li>
            <li>Sözleşmesiz iletişim: 2 yıl.</li>
            <li>Çerez verisi: 12 aya kadar.</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">6. Kullanıcı Hakları (KVKK m.11)</h2>
          <p className="text-slate-700 mb-3">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme.</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme.</li>
            <li>İşleme amacını ve uygunluğunu sorgulama.</li>
            <li>Yurt içi/dışı aktarılan tarafları bilme.</li>
            <li>Eksik/yanlış işlenmişse düzeltilmesini isteme.</li>
            <li>Silinmesini veya yok edilmesini isteme.</li>
            <li>İşleme aktarıldığı taraflara bildirilmesini isteme.</li>
            <li>Otomatik sistemlerle çıkan sonuca itiraz etme.</li>
            <li>Zarar oluştuysa giderilmesini talep etme.</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">7. Başvuru</h2>
          <p className="text-slate-700 mb-4">
            Haklarınızı kullanmak için info@tripandtick.com adresine kimliğinizi
            doğrulayan belgelerle birlikte yazılı başvuru yapabilirsiniz. En geç{" "}
            <strong>30 gün içinde</strong> ücretsiz olarak yanıtlayacağız.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">8. Güvenlik</h2>
          <p className="text-slate-700 mb-4">
            Veriler HTTPS şifreli iletişim, hash'lenmiş şifreler, role-based access ve
            düzenli güvenlik denetimleriyle korunur. Veri ihlali durumunda Kişisel
            Verileri Koruma Kurulu'na 72 saat içinde bildirim yapılır.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">9. Çerezler</h2>
          <p className="text-slate-700 mb-4">
            Sitemiz çerez kullanır. Detay için{" "}
            <Link href="/cerez-politikasi" className="text-accent font-semibold hover:underline">
              Çerez Politikası
            </Link>{" "}
            sayfamıza bakın.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">10. Değişiklikler</h2>
          <p className="text-slate-700 mb-4">
            Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişikliklerde size
            e-posta ile bildirim yaparız. Devam eden kullanım güncellenmiş politikayı
            kabul anlamına gelir.
          </p>

          <div className="mt-10 bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-700 mb-2 font-bold">İletişim</p>
            <p className="text-sm text-slate-600">
              Sorularınız için:{" "}
              <a href="mailto:info@tripandtick.com" className="text-accent font-semibold">
                info@tripandtick.com
              </a>
            </p>
          </div>
        </div>
      </article>

      <JsonLd data={breadcrumbSchema([{ name: "Gizlilik Politikası", href: "/gizlilik-politikasi" }])} />
    </>
  );
}
