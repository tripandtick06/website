import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Kullanım Şartları — Mesafeli Satış Sözleşmesi | Trip and Tick",
  description:
    "Trip and Tick kullanım şartları ve mesafeli satış sözleşmesi: hizmet kapsamı, ödeme, iptal, sorumluluk reddi ve uyuşmazlık çözümü.",
  alternates: { canonical: `${SITE_URL}/kullanim-sartlari` },
};

export default function KullanimSartlariPage() {
  return (
    <>
      <PageHero
        tag="Yasal"
        title="Kullanım"
        highlight="Şartları"
        description="Trip and Tick hizmetlerinin kullanım şartları ve mesafeli satış sözleşmesi. Lütfen rezervasyon öncesi okuyun."
      />

      <Breadcrumb items={[{ name: "Kullanım Şartları", href: "/kullanim-sartlari" }]} />

      <article className="section-padding bg-white">
        <div className="container-main max-w-4xl">
          <p className="text-sm text-slate-500 mb-6">
            Yürürlük tarihi: 1 Mayıs 2026 · Son güncelleme: 15 Mayıs 2026
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">1. Taraflar</h2>
          <p className="text-slate-700 mb-3">
            Satıcı: <strong>Trip and Tick Turizm ve Seyahat Acentası Limited Şirketi</strong>{" "}
            (bundan sonra "Trip and Tick"). Adres: Göreme Merkez, Nevşehir 50180. TÜRSAB
            lisanslı.
          </p>
          <p className="text-slate-700 mb-4">
            Alıcı: tripandtick.com üzerinden hizmet satın alan veya satın almayı taahhüt
            eden gerçek/tüzel kişi (bundan sonra "Müşteri").
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">2. Hizmet Kapsamı</h2>
          <p className="text-slate-700 mb-4">
            Trip and Tick, balon turu, otel rezervasyonu, transfer, ATV, at binme, gezi
            turları ve kombo paketler dahil olmak üzere Kapadokya bölgesindeki turizm
            hizmetlerini aracılık edici sıfatla satar. Hizmetler, anlaşmalı operatörler
            tarafından fiilen sunulur; Trip and Tick rezervasyon, ödeme ve müşteri
            desteği işlemlerini yönetir.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">3. Fiyatlandırma & Para Birimleri</h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>Fiyatlar EUR, USD veya TRY cinsinden gösterilir.</li>
            <li>Tüm vergiler (KDV dahil) fiyata dahildir.</li>
            <li>Çocuk indirimi 7-12 yaş arası uygulanır (paket bazında değişir).</li>
            <li>Yüksek sezon (Nisan-Haziran, Eylül-Ekim) ek ücret yansıyabilir.</li>
            <li>En düşük fiyat garantisi: daha ucuz teklif bulursanız %5 altı.</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">4. Ödeme</h2>
          <p className="text-slate-700 mb-4">
            Ödeme; Visa, Mastercard, American Express ve UnionPay ile yapılabilir. 3D
            Secure aktiftir. Kart bilgileri Trip and Tick'te saklanmaz; PCI-DSS uyumlu
            ödeme sağlayıcılarına yönlendirilir. Rezervasyon, ödeme onayından sonra
            kesinleşir; onay e-postası ile birlikte PDF biletiniz iletilir.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">5. İptal & İade</h2>
          <p className="text-slate-700 mb-4">
            İptal politikamızın tam metni için{" "}
            <Link href="/iptal-iade-politikasi" className="text-accent font-semibold hover:underline">
              İptal & İade Politikası
            </Link>{" "}
            sayfasına bakın. Özet: 72+ saat önce %100 iade, 24-72 saat %50 iade, 24 saat
            altı iade yok. Operatör veya hava kaynaklı iptalde her zaman %100 iade veya
            alternatif tarih.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">6. Müşteri Yükümlülükleri</h2>
          <ul className="list-disc pl-6 space-y-1.5 text-slate-700 mb-4">
            <li>Doğru ad, doğum tarihi ve iletişim bilgisi vermek.</li>
            <li>Hamilelik veya ciddi sağlık sorunu varsa rezervasyon öncesi bildirmek.</li>
            <li>Yaş ve kilo limitlerine uymak (balon: 6+ yaş).</li>
            <li>Buluşma saatinde hazır olmak; gecikme durumunda iade hakkı yoktur.</li>
            <li>Operatör güvenlik kurallarına uymak.</li>
          </ul>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">7. Sorumluluk Reddi</h2>
          <p className="text-slate-700 mb-4">
            Trip and Tick, hizmeti fiilen sunan operatörün gerçekleştirdiği uçuş,
            transfer veya aktivite sırasında oluşan kişisel kazalardan birinci derecede
            sorumlu değildir; ancak operatörler 40 milyon Euro mali sorumluluk sigortası
            kapsamındadır. Hava kaynaklı veya zorunlu iptal durumunda iade koşulları
            uygulanır.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">8. Fikri Mülkiyet</h2>
          <p className="text-slate-700 mb-4">
            Site içeriği (metin, görsel, kod, logo, marka) Trip and Tick'e aittir. Yazılı
            izin olmadan kopyalanması, yeniden dağıtılması veya ticari amaçla
            kullanılması yasaktır.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">9. Tüketici Hakları</h2>
          <p className="text-slate-700 mb-4">
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
            Yönetmeliği hükümleri geçerlidir. Tüketici Hakem Heyetleri ve Tüketici
            Mahkemeleri'ne başvuru hakkınız vardır. Detaylı bilgi için{" "}
            <Link href="/kvkk" className="text-accent font-semibold hover:underline">
              KVKK
            </Link>{" "}
            sayfamıza bakın.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">10. Uyuşmazlık Çözümü</h2>
          <p className="text-slate-700 mb-4">
            Uyuşmazlık halinde öncelikle Trip and Tick müşteri desteğine başvuru yapın.
            Çözüm bulunamazsa Nevşehir Tüketici Hakem Heyeti veya Nevşehir Tüketici
            Mahkemeleri yetkilidir. Uygulanacak hukuk Türk hukukudur.
          </p>

          <h2 className="text-2xl font-extrabold mt-8 mb-3">11. Değişiklikler</h2>
          <p className="text-slate-700 mb-4">
            Trip and Tick bu şartları zaman zaman güncelleyebilir. Güncel versiyon
            tripandtick.com/kullanim-sartlari adresinde yayımlanır; kullanıma devam etmek
            güncel şartların kabulü anlamına gelir.
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

      <JsonLd data={breadcrumbSchema([{ name: "Kullanım Şartları", href: "/kullanim-sartlari" }])} />
    </>
  );
}
