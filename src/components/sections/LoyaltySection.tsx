// Sadakat Programimiz — Homepage section.
//
// Importers:
//   - src/app/page.tsx (Reviews'ten sonra mount)
// Glob check: src/components/sections/LoyaltySection.tsx daha once yoktu.
// User verbatim: "3 kart: Puan Kazan / Tier Yukseliş / Referans Bonusu; CTA '/hesabim'"

"use client";

import { Link } from "@/i18n/routing";
import { Sparkles, Crown, Gift, ChevronRight } from "lucide-react";
import { LOYALTY_CONFIG } from "@/data/loyalty";
import { useT } from "@/lib/i18n/I18nProvider";

export function LoyaltySection() {
  const t = useT();
  const PERKS = [
    {
      title: t.component.sections.loyalty.perk_puan_kazan_title,
      desc: t.component.sections.loyalty.perk_puan_kazan_desc
        .replace(/\{earnRate\}/g, String(LOYALTY_CONFIG.earnRate))
        .replace(/\{redemptionRate\}/g, String(LOYALTY_CONFIG.redemptionRate)),
      icon: Sparkles,
      color: "bg-amber-100 text-amber-700",
    },
    {
      title: t.component.sections.loyalty.perk_tier_yukselis_title,
      desc: t.component.sections.loyalty.perk_tier_yukselis_desc
        .replace(/\{silverMin\}/g, String(LOYALTY_CONFIG.tiers[1].min))
        .replace(/\{goldMin\}/g, String(LOYALTY_CONFIG.tiers[2].min))
        .replace(/\{platinumMin\}/g, String(LOYALTY_CONFIG.tiers[3].min))
        .replace(/\{maxDiscount\}/g, String(LOYALTY_CONFIG.tiers[3].discount)),
      icon: Crown,
      color: "bg-violet-100 text-violet-700",
    },
    {
      title: t.component.sections.loyalty.perk_referans_bonusu_title,
      desc: t.component.sections.loyalty.perk_referans_bonusu_desc.replace(
        /\{referralBonus\}/g,
        String(LOYALTY_CONFIG.referralBonus)
      ),
      icon: Gift,
      color: "bg-rose-100 text-rose-700",
    },
  ];
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-amber-50 via-white to-rose-50">
      <div className="container-main">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> {t.component.sections.loyalty.sadakat_programi}
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
            {t.component.sections.loyalty.her_rezervasyon_sonraki_tatile}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {t.component.sections.loyalty.trip_tick_uzerinden_yaptiginiz}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {PERKS.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.title}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl ${p.color} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1.5">{p.title}</h3>
                <p className="text-sm text-slate-600">{p.desc}</p>
              </article>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/hesabim"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            {t.component.sections.loyalty.puanlarima_bak} <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/balonlar"
            className="inline-flex items-center gap-2 bg-white border-2 border-amber-300 text-amber-700 font-bold px-6 py-3 rounded-xl hover:bg-amber-50 transition-colors"
          >
            {t.component.sections.loyalty.hemen_rezervasyon_yap}
          </Link>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          {t.component.sections.loyalty.hosgeldin_bonusu_ilk}{LOYALTY_CONFIG.firstBookingBonus} {t.component.sections.loyalty.puan_yorum_bonusu}{LOYALTY_CONFIG.reviewBonus} {t.component.sections.loyalty.puan_mobil_uygulama}{LOYALTY_CONFIG.appDownloadBonus} puan.
        </p>
      </div>
    </section>
  );
}
