import type { Metadata } from "next";
import Link from "next/link";
import { Wind, Bike, TreePine, Package, BookOpen, Mountain } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { KAPADOKYA_PILLARS } from "@/data/services/catalog";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Kapadokya Rehberi 2026 — Balon, Otel, Tur, Aktiviteler | Trip and Tick",
  description:
    "Kapadokya tatil rehberi: balon turu fiyatları, en iyi oteller, gezi turları, aktiviteler, fotoğraf noktaları ve ne zaman gidilir? Detaylı tüm rehber tek sayfada.",
  alternates: { canonical: `${SITE_URL}/kapadokya` },
};

const CATEGORIES = [
  {
    href: "/balonlar",
    icon: Wind,
    title: "Balon Turları",
    desc: "€165'ten başlayan paketler, 9+ operatör",
    color: "from-accent to-accent-light",
  },
  {
    href: "/aktiviteler",
    icon: Bike,
    title: "Aktiviteler",
    desc: "ATV, at binme, jeep safari — €29'dan",
    color: "from-success to-success-light",
  },
  {
    href: "/turlar",
    icon: TreePine,
    title: "Gezi Turları",
    desc: "Kırmızı, Yeşil, gün batımı turları",
    color: "from-primary to-primary-light",
  },
  {
    href: "/paketler",
    icon: Package,
    title: "Kombo Paketler",
    desc: "Balon + otel + tur avantajlı paketler",
    color: "from-warning to-warning-light",
  },
];

export default function KapadokyaPage() {
  return (
    <>
      <PageHero
        tag="Kapadokya Rehberi"
        title="Kapadokya"
        highlight="Tatil Rehberi 2026"
        description="UNESCO Dünya Mirası listesinde, peri bacaları, yeraltı şehirleri ve dünyaca ünlü balon turlarıyla Türkiye'nin en büyülü destinasyonu. Tek sayfada tüm bilgiler."
      />

      <Breadcrumb items={[{ name: "Kapadokya", href: "/kapadokya" }]} />

      {/* Intro */}
      <section className="bg-white section-padding">
        <div className="container-main max-w-4xl">
          <div className="prose-lg text-slate-700 space-y-4 leading-relaxed">
            <p className="text-lg speakable">
              <strong>Kapadokya</strong>, Türkiye'nin İç Anadolu bölgesinde yer alan ve
              <strong> UNESCO Dünya Mirası Listesi'nde</strong> bulunan dünyaca ünlü bir
              tatil destinasyonudur. Milyonlarca yıl önce volkanik patlamalarla şekillenen{" "}
              <strong>peri bacaları</strong>, Bizans dönemine ait kayaya oyma kiliseler ve
              tarih öncesi yeraltı şehirleri, bölgeyi yılda 4 milyondan fazla turistin
              ziyaret ettiği bir kültür-doğa merkezi haline getirir.
            </p>
            <p>
              Kapadokya denildiğinde akla ilk gelen{" "}
              <strong>sıcak hava balon turlarıdır</strong>. Gün doğumunda yüzlerce
              renkli balonun semayı süslediği bu deneyim,{" "}
              <strong>9'dan fazla TÜRSAB lisanslı operatör</strong> tarafından sunulur.
              Standart €165, Konfor €215, Deluxe €295 ve Romantik özel €580'den başlayan
              fiyatlar — transfer, kahvaltı, sigorta, sertifika ve şampanya servisi dahil.
            </p>
            <p>
              Balon dışında ATV turları, at binme deneyimleri, Kırmızı ve Yeşil gezi
              turları, mağara otel konaklamaları ve yeraltı şehri ziyaretleri ile
              Kapadokya 2-5 günlük tatil için ideal bir destinasyondur. En iyi ziyaret
              dönemi <strong>Nisan-Haziran</strong> ve <strong>Eylül-Ekim</strong>{" "}
              aralığıdır — balon uçuş oranları %85+ seviyesindedir.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="text-center mb-12">
            <span className="section-tag">Kategoriler</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              Ne Yapabilirsiniz?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="card overflow-hidden group"
              >
                <div className={`h-32 bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                  <c.icon className="w-14 h-14 text-white/90 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 mb-1.5">{c.title}</h3>
                  <p className="text-sm text-slate-600">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pillar articles */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="text-center mb-12">
            <span className="section-tag">Detaylı Rehberler</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
              Kapadokya Hakkında Bilgi Bankası
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Planlamadan en iyi fotoğraf noktalarına kadar — Kapadokya hakkında bilmek
              istediğiniz her şey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {KAPADOKYA_PILLARS.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="card p-6 group flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/[0.08] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1 group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-600">{p.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white section-padding">
        <div className="container-main text-center">
          <Mountain className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Kapadokya Maceranız Şimdi Başlasın
          </h2>
          <p className="text-lg text-white/85 mb-6 max-w-2xl mx-auto">
            En düşük fiyat garantisi, %100 iade güvencesi ve anında onay ile hayalinizdeki
            tatili rezerve edin.
          </p>
          <Link href="/balonlar" className="btn-accent inline-block text-base">
            Balon Turlarına Bak
          </Link>
        </div>
      </section>

      <JsonLd data={breadcrumbSchema([{ name: "Kapadokya", href: "/kapadokya" }])} />
    </>
  );
}
