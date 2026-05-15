import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Users, Star, Award, Heart, Target, Eye, Trophy } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Hakkımızda — TÜRSAB Lisanslı Kapadokya Acentası | Trip and Tick",
  description:
    "Trip and Tick: 2024'ten beri Kapadokya'da hizmet veren TÜRSAB lisanslı online seyahat acentası. 9+ operatör, 12.000+ mutlu müşteri, en düşük fiyat garantisi.",
  alternates: { canonical: `${SITE_URL}/hakkimizda` },
};

const STATS = [
  { icon: Users, value: "12.000+", label: "Mutlu Müşteri" },
  { icon: Star, value: "4.9 / 5", label: "Müşteri Puanı" },
  { icon: Shield, value: "9+", label: "Lisanslı Operatör" },
  { icon: Award, value: "%100", label: "İade Garantisi" },
];

const VALUES = [
  {
    icon: Heart,
    title: "Müşteri Önce",
    desc: "Her rezervasyon bir aile veya çift için unutulmaz bir an. Bu sorumluluğu en başa koyuyoruz.",
  },
  {
    icon: Shield,
    title: "Güven",
    desc: "TÜRSAB lisansı, 40M€ sigorta, 3D Secure ödeme, KVKK uyumu — şeffaflık temel değerimiz.",
  },
  {
    icon: Target,
    title: "Şeffaflık",
    desc: "Gizli ücret yok. Fiyatlar son rakam — vergi, transfer, kahvaltı dahil. İptal politikası net.",
  },
  {
    icon: Trophy,
    title: "En İyi Fiyat",
    desc: "Doğrudan operatör anlaşmaları — aracı yok. En düşük fiyat garantisi: bulursanız %5 altı.",
  },
];

export default function HakkimizdaPage() {
  return (
    <>
      <PageHero
        tag="Hakkımızda"
        title="Trip and Tick"
        highlight="Hikayemiz"
        description="Kapadokya'nın en güvenilir online seyahat acentası. TÜRSAB lisanslı, 9+ operatörle doğrudan anlaşmalı, 2024'ten beri 12.000+ mutlu müşteri."
      />

      <Breadcrumb items={[{ name: "Hakkımızda", href: "/hakkimizda" }]} />

      <section className="bg-white py-12 border-b border-slate-200">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-10 h-10 text-accent mx-auto mb-2" />
                <div className="text-3xl font-extrabold text-primary">{s.value}</div>
                <div className="text-sm text-slate-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-main max-w-4xl">
          <span className="section-tag">Hikayemiz</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
            Neden Trip and Tick?
          </h2>
          <div className="space-y-4 text-slate-700 leading-relaxed text-lg">
            <p>
              Trip and Tick, 2024 yılında Kapadokya'nın yerel turizm ekosisteminden gelen
              bir ekiple kuruldu. Kurucularımız, bölgedeki balon operatörleri, otel
              sahipleri ve transfer şirketleriyle 15+ yıllık doğrudan ilişkilere sahiptir.
              Bu güvene dayalı ağ, aracı komisyonu eklenmeden direkt fiyatla hizmet
              sunmamızı sağlar.
            </p>
            <p>
              Geleneksel acente modeli pazarda %25-40 komisyonla çalışır; bu, müşteriye
              gereksiz yere yüksek fiyatla yansır. Biz ise modeli tersine çevirdik:
              operatörle <strong>%10-15 ortaklık komisyonu</strong> ve müşteriye{" "}
              <strong>en düşük net fiyat</strong>. Sonuç: aynı paket, %25-40 daha ucuz.
            </p>
            <p>
              <strong>TÜRSAB lisansımız</strong> Türk turizm standartlarına uyum
              garantisidir. 40 milyon Euro mali sorumluluk sigortası, KVKK uyumlu veri
              politikası, 3D Secure ödeme altyapısı ve 7/24 müşteri desteği ile yurt içi
              ve yurt dışı misafirler için aynı kaliteyi sunuyoruz.
            </p>
            <p>
              Kapadokya'da satılan her balon turunun, jeep safari biletinin ve otel
              gecesinin gerisinde yerel ekonomi var: pilotlar, rehberler, şoförler ve
              otel personeli. Trip and Tick olarak{" "}
              <strong>yerel istihdama destek</strong> ilkesiyle çalışıyor, doğru
              fiyatlandırma ile bölgenin sürdürülebilir turizmine katkı sağlıyoruz.
            </p>
            <p>
              Misafirlerimizin %92'si rezervasyondan sonra arkadaş veya aile referansı
              ile tekrar dönmektedir. Bu güveni korumak için her detayı kontrol ediyor,
              operatör performansını sürekli denetliyoruz. Standartların altına düşen
              operatörlerle çalışmaya devam etmiyoruz.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-main max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary text-white rounded-2xl p-8">
              <Target className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-2xl font-extrabold mb-3">Misyonumuz</h3>
              <p className="text-white/85 leading-relaxed">
                Kapadokya tatilini herkes için <strong>uygun fiyatlı, şeffaf ve
                güvenli</strong> hale getirmek. Aracı komisyonunu kaldırarak müşteriye
                hak ettiği değeri sunmak; operatörlere adil ortaklık sağlamak.
              </p>
            </div>
            <div className="bg-accent text-white rounded-2xl p-8">
              <Eye className="w-10 h-10 text-white mb-4" />
              <h3 className="text-2xl font-extrabold mb-3">Vizyonumuz</h3>
              <p className="text-white/95 leading-relaxed">
                2027'ye kadar <strong>Türkiye'nin en güvenilir online seyahat
                acentası</strong> olmak. Kapadokya'dan başlayarak Pamukkale, Antalya ve
                Karadeniz destinasyonlarına genişlemek.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-slate-50">
        <div className="container-main max-w-5xl">
          <div className="text-center mb-10">
            <span className="section-tag">Değerlerimiz</span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Bizi Diğerlerinden Ayıran 4 İlke
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-accent/[0.08] flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-accent" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">{v.title}</h4>
                <p className="text-slate-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16">
        <div className="container-main text-center">
          <h2 className="text-3xl font-extrabold mb-3">Sorularınız mı var?</h2>
          <p className="text-white/85 mb-6 max-w-xl mx-auto">
            Ekibimiz 7/24 hizmetinizde. WhatsApp, e-posta veya telefonla bize ulaşın.
          </p>
          <Link href="/iletisim" className="btn-accent inline-block">
            İletişime Geç
          </Link>
        </div>
      </section>

      <JsonLd data={breadcrumbSchema([{ name: "Hakkımızda", href: "/hakkimizda" }])} />
    </>
  );
}
