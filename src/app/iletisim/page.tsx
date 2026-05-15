import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { ContactForm } from "./ContactForm";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";
import { generateHreflang, ogImageUrl } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "İletişim — Trip and Tick Kapadokya Acentası",
  description:
    "Trip and Tick ile iletişime geçin: info@tripandtick.com, +90 500 123 45 67. Göreme/Nevşehir ofisi. WhatsApp 7/24, e-posta 4 saat içinde yanıt.",
  alternates: {
    canonical: `${SITE_URL}/iletisim`,
    languages: generateHreflang("/iletisim"),
  },
  openGraph: {
    title: "İletişim — Trip and Tick",
    description: "WhatsApp 7/24, e-posta 4 saat içinde yanıt, Göreme/Nevşehir ofisi.",
    url: `${SITE_URL}/iletisim`,
    type: "website",
    images: [
      {
        url: ogImageUrl(
          "İletişim",
          "WhatsApp 7/24 · E-posta 4 saat · Göreme Ofis"
        ),
        width: 1200,
        height: 630,
        alt: "İletişim — Trip and Tick",
      },
    ],
  },
};

const CONTACT_ITEMS = [
  { icon: Mail, label: "E-posta", value: "info@tripandtick.com", href: "mailto:info@tripandtick.com", note: "4 saat içinde yanıt (mesai saati)" },
  { icon: Phone, label: "Telefon", value: "+90 500 123 45 67", href: "tel:+905001234567", note: "TR/EN destek" },
  { icon: MessageCircle, label: "WhatsApp", value: "+90 500 123 45 67", href: "https://wa.me/905001234567", note: "7/24 anlık mesaj" },
  { icon: MapPin, label: "Ofis", value: "Göreme Merkez, Nevşehir 50180", href: "https://maps.google.com/?q=Goreme+Nevsehir", note: "Türkiye" },
];

export default function IletisimPage() {
  return (
    <>
      <PageHero
        tag="İletişim"
        title="Bizimle"
        highlight="İletişime Geç"
        description="Sorularınız, özel istekleriniz veya kurumsal rezervasyon için 7/24 hizmetinizdeyiz. WhatsApp, e-posta veya telefonla bize ulaşın."
      />

      <Breadcrumb items={[{ name: "İletişim", href: "/iletisim" }]} />

      <section className="section-padding bg-slate-50">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
                İletişim Bilgileri
              </h2>
              <div className="space-y-4 mb-8">
                {CONTACT_ITEMS.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-accent hover:shadow-card transition-all"
                  >
                    <div className="w-12 h-12 bg-primary/[0.08] rounded-lg flex items-center justify-center flex-shrink-0">
                      <c.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">
                        {c.label}
                      </div>
                      <div className="font-bold text-slate-900">{c.value}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.note}</div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
                <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-700">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>Çalışma Saatleri</span>
                </div>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>WhatsApp & E-posta: 7/24</li>
                  <li>Telefon: 09:00 - 22:00 (TSİ)</li>
                  <li>Acil iptal/değişiklik: 7/24 WhatsApp</li>
                </ul>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-card">
                <iframe
                  title="Trip and Tick — Göreme, Nevşehir konumu"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3175.5!2d34.8289!3d38.6431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sG%C3%B6reme!5e0!3m2!1str!2str!4v1736000000000"
                  width="100%"
                  height="360"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <a
                href="https://maps.google.com/?q=G%C3%B6reme,%20Nev%C5%9Fehir,%20T%C3%BCrkiye"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors"
              >
                <MapPin className="w-4 h-4" /> Yol Tarifi
              </a>
            </div>

            <div>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                  Mesaj Gönder
                </h2>
                <p className="text-sm text-slate-600 mb-6">
                  Form doldurun, en geç 4 saat içinde dönüş yapalım. Acil durumlar için
                  WhatsApp kullanın.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      <JsonLd data={breadcrumbSchema([{ name: "İletişim", href: "/iletisim" }])} />
    </>
  );
}
