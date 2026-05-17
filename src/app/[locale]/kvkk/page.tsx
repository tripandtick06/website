import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni — 6698 Sayılı Kanun | Trip and Tick",
  description:
    "Trip and Tick KVKK aydınlatma metni: veri sorumlusu, kişisel veri işleme amaçları, aktarım, saklama ve KVKK m.11 kapsamındaki kullanıcı hakları.",
  alternates: {
    canonical: `${SITE_URL}/kvkk`,
    languages: generateHreflang("/kvkk"),
  },
  openGraph: {
    title: "KVKK Aydınlatma Metni",
    description: "6698 Sayılı Kanun · Veri sorumlusu · Kullanıcı hakları.",
    url: `${SITE_URL}/kvkk`,
    type: "website",
    images: [
      {
        url: ogImageUrl("KVKK Aydınlatma Metni", "6698 Sayılı Kanun"),
        width: 1200,
        height: 630,
        alt: "KVKK — Trip and Tick",
      },
    ],
  },
};

export default function KvkkPage() {
  return (
    <>
      <PageHero
        tag="Yasal"
        title="KVKK"
        highlight="Aydınlatma Metni"
        description="6698 Sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla yasal bilgilendirme."
      />

      <Breadcrumb items={[{ name: "KVKK", href: "/kvkk" }]} />

      <article className="section-padding bg-white">
        <div className="container-main max-w-4xl">
          <p className="text-sm text-slate-500 mb-6">
            Yürürlük tarihi: 1 Mayıs 2026 · Son güncelleme: 15 Mayıs 2026
          </p>

          <h2 className="text-2xl font-extrabold mt-4 mb-3">1. Veri Sorumlusu</h2>
          <p className="text-slate-700 mb-3">
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri
            sorumlusu sıfatıyla{" "}
            <strong>Trip and Tick Turizm ve Seyahat Acentası Limited Şirketi</strong>{" "}
            olarak Kişisel Verilerin Korunması Kurulu'nun ilkelerine uygun davrandığımızı
            beyan ederiz.
          </p>
          <p className="text-slate-700 mb-4">
            <strong>Adres:</strong> Göreme Merkez, Nevşehir 50180, Türkiye<br />
            <strong>E-posta:</strong> info@tripandtick.com<br />
            <strong>Telefon:</strong> +90 537 464 78 61
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            2. Kişisel Verilerin İşlenme Amaçları
          </h2>
          <p className="text-slate-700 mb-3">Kişisel verileriniz aşağıdaki amaçlarla işlenir:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>Mesafeli satış sözleşmesinin kurulması ve ifası.</li>
            <li>Rezervasyon işleme, ödeme tahsilatı, fatura düzenleme.</li>
            <li>Operatöre rezervasyon bildirimi ve hizmet teslimatı.</li>
            <li>Müşteri desteği, şikayet ve talep yönetimi.</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, TÜRSAB).</li>
            <li>Pazarlama iletişimi (yalnızca açık onay halinde).</li>
            <li>Hizmet kalitesinin iyileştirilmesi, anonim analitik.</li>
            <li>Veri güvenliği, dolandırıcılık önleme.</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            3. İşleme Hukuki Sebepleri (KVKK m.5)
          </h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>Sözleşmenin kurulması veya ifası için zorunlu olması (m.5/2-c).</li>
            <li>Hukuki yükümlülüğün yerine getirilmesi için zorunlu olması (m.5/2-ç).</li>
            <li>Veri sorumlusunun meşru menfaati (m.5/2-f) — analitik, güvenlik.</li>
            <li>Açık rıza (m.5/1) — pazarlama amaçlı işleme.</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            4. Kişisel Verilerin Aktarımı
          </h2>
          <p className="text-slate-700 mb-3">
            Verileriniz aşağıdaki alıcı gruplarına KVKK m.8 ve m.9 uyarınca aktarılabilir:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>Anlaşmalı operatörler (rezervasyon bilgileri).</li>
            <li>Ödeme sağlayıcısı (Stripe — PCI-DSS).</li>
            <li>E-posta servisi (Brevo) — yurt içi.</li>
            <li>Yetkili kamu kurumları (yasal talep halinde).</li>
            <li>Hukuki danışmanlar ve mali müşavirler.</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">5. Saklama Süreleri</h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>Sözleşme ilişkisi devam ettiği sürece ve devamında 10 yıl.</li>
            <li>Vergi mevzuatı kapsamındaki belgeler: 5 yıl.</li>
            <li>Pazarlama amaçlı kayıtlar: rıza geri çekilene kadar.</li>
            <li>Çerez verisi: 12 aya kadar.</li>
            <li>Yasal saklama süresi sonunda veriler güvenli yöntemle imha edilir.</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">
            6. Veri Sahibinin Hakları (KVKK m.11)
          </h2>
          <p className="text-slate-700 mb-3">Veri sahibi sıfatıyla aşağıdaki haklara sahipsiniz:</p>
          <ol className="list-decimal pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>Kişisel veri işlenip işlenmediğini öğrenme.</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme.</li>
            <li>İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme.</li>
            <li>Yurt içi/dışında verilerin aktarıldığı 3. kişileri bilme.</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme.</li>
            <li>KVKK m.7'de öngörülen şartlar çerçevesinde silinmesini/yok edilmesini isteme.</li>
            <li>(5) ve (6) bentleri uyarınca yapılan işlemlerin aktarıldığı 3. kişilere bildirilmesini isteme.</li>
            <li>Otomatik sistemlerle analiz edilmesi sonucu aleyhine bir sonuç çıkmasına itiraz etme.</li>
            <li>Hukuka aykırı işleme sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme.</li>
          </ol>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">7. Başvuru Yöntemleri</h2>
          <p className="text-slate-700 mb-3">
            KVKK m.13 kapsamında haklarınızı kullanmak için aşağıdaki yöntemlerden biriyle
            başvurabilirsiniz:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>
              <strong>E-posta:</strong>{" "}
              <a href="mailto:info@tripandtick.com" className="text-accent font-semibold">
                info@tripandtick.com
              </a>
            </li>
            <li><strong>Posta:</strong> Göreme Merkez, Nevşehir 50180 — kimlik kopyasıyla.</li>
            <li><strong>Noter ihtarnamesi:</strong> resmi kayıtlı yöntem.</li>
          </ul>
          <p className="text-slate-700 mb-4">
            Başvurunuz <strong>en geç 30 gün içinde</strong> ücretsiz olarak yanıtlanır.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">8. Şikayet Hakkı</h2>
          <p className="text-slate-700 mb-3">
            Başvurunuzun reddedilmesi, verilen yanıtın yetersiz bulunması veya 30 gün
            içinde yanıt verilmemesi durumunda Kişisel Verileri Koruma Kurulu'na şikayet
            hakkınız vardır:
          </p>
          <p className="text-slate-700 mb-4">
            <strong>Kişisel Verileri Koruma Kurumu:</strong>{" "}
            <a
              href="https://www.kvkk.gov.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent font-semibold"
            >
              www.kvkk.gov.tr
            </a>
          </p>

          <div className="mt-10 bg-primary text-white rounded-2xl p-6">
            <p className="font-bold mb-2">Bilgi Notu</p>
            <p className="text-sm text-white/90 leading-relaxed">
              Bu aydınlatma metni KVKK uyumluluğu için hazırlanmıştır. Detaylı veri
              işleme süreci için{" "}
              <Link href="/gizlilik-politikasi" className="text-accent font-semibold underline">
                Gizlilik Politikası
              </Link>{" "}
              sayfamıza bakabilirsiniz.
            </p>
          </div>
        </div>
      </article>

      <JsonLd data={breadcrumbSchema([{ name: "KVKK", href: "/kvkk" }])} />
    </>
  );
}
