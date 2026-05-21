"use client";

import { ShieldCheck, Lock, BadgeDollarSign, Award, Globe } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";

export function GuaranteeSection() {
  const t = useT();
  const g = t.component.sections.guarantee;

  const GUARANTEES = [
    { icon: ShieldCheck, title: t.trust.refund, sub: g.sub_tam_iade },
    { icon: Lock, title: t.trust.secure, sub: g.sub_pci_dss },
    { icon: BadgeDollarSign, title: g.en_dusuk_fiyat, sub: g.sub_fiyat_farki },
    { icon: Award, title: t.trust.insurance, sub: g.sub_tum_ucuslarda },
    { icon: Globe, title: t.trust.languages, sub: g.sub_kendi_dilinizde },
  ];

  return (
    <section className="relative bg-gradient-to-br from-[#0F1B4D] via-primary to-[#2A1A4A] text-white py-20 sm:py-24 overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent/[0.06] blur-3xl pointer-events-none" />

      <div className="container-main relative text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
          {g.headline_ucuzunu}
          <br />
          <span className="text-accent">{g.headline_buldunuz_mu}</span>
        </h2>
        <p className="text-white/65 text-lg max-w-xl mx-auto mb-12">
          {g.subtext_teklif}{" "}
          <strong className="text-white">{g.subtext_yuzde_5}</strong>{" "}
          {g.subtext_ineriz}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {GUARANTEES.map((g) => (
            <div
              key={g.title}
              className="bg-white/[0.07] border border-white/[0.12] backdrop-blur-sm rounded-2xl px-6 py-5 min-w-[190px] flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <g.icon className="w-6 h-6 text-accent" />
              </div>
              <span className="font-bold text-sm">{g.title}</span>
              <span className="text-xs text-white/50">{g.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
