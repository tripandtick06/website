import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PageHero } from "@/components/layout/PageHero";
import { JsonLd } from "@/components/layout/JsonLd";
import { ContactForm } from "./ContactForm";
import { breadcrumbSchema, SITE_URL } from "@/lib/schema";

export const metadata: Metadata = {
  title: "İletişim — Trip and Tick Kapadokya Acentası",
  description:
    "Trip and Tick ile iletişime geçin: info@tripandtick.com, +90 500 123 45 67. Göreme/Nevşehir ofisi. WhatsApp 7/24, e-posta 4 saat içinde yanıt.",
  alternates: { canonical: `${SITE_URL}/iletisim` },
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

              <div className="bg-slate-200 rounded-2xl h-64 flex items-center justify-center border border-slate-300">
                <div className="text-center text-slate-500 p-4">
                  <MapPin className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Göreme Merkez, Nevşehir</p>
                  <p className="text-xs mt-1">
                    Harita yakında — şimdilik adres üstündeki Google Maps linkini kullanın.
                  </p>
                </div>
              </div>
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
