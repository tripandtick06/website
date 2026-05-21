"use client";

import { ListFilter, CalendarCheck, PenLine, CreditCard, MailCheck } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";

const STEPS = [
  { num: 1, icon: ListFilter, title: "Hizmeti Seç", desc: "Balon, tur, aktivite veya paket — ihtiyacınıza göre filtreleyin." },
  { num: 2, icon: CalendarCheck, title: "Tarih & Kişi", desc: "Tarihinizi seçin, anlık müsaitliği görün, kişi sayısını belirleyin." },
  { num: 3, icon: PenLine, title: "Bilgileri Girin", desc: "Yolcu bilgilerini doldurun, seyahat sigortası ekleyin." },
  { num: 4, icon: CreditCard, title: "Güvenli Öde", desc: "Visa, Mastercard, 3D Secure ile EUR veya TRY ödeme." },
  { num: 5, icon: MailCheck, title: "Bilet E-postanızda", desc: "PDF biletiniz anında e-postanıza gelir. Hazırsınız!" },
];

export function StepsSection() {
  const t = useT();
  return (
    <section className="section-padding bg-white">
      <div className="container-main">
        <div className="text-center mb-14">
          <span className="section-tag">{t.component.sections.steps.nasil_calisir}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t.component.sections.steps.rezervasyon_dakikada}
          </h2>
          <p className="text-slate-500 mt-3">{t.component.sections.steps.hizli_kolay_guvenli_karmasik}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-0 max-w-5xl mx-auto relative">
          {/* Connecting Line (desktop) */}
          <div className="hidden lg:block absolute top-8 left-[8%] right-[8%] h-0.5 bg-slate-200" />

          {STEPS.map((step) => (
            <div key={step.num} className="flex-1 text-center relative group">
              <div className="w-16 h-16 rounded-full bg-white border-[3px] border-slate-200 flex items-center justify-center mx-auto mb-4 relative z-10 transition-all group-hover:border-accent group-hover:bg-accent/5">
                <step.icon className="w-6 h-6 text-slate-400 group-hover:text-accent transition-colors" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{step.title}</h4>
              <p className="text-sm text-slate-500 px-3">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
