// Sadakat Programimiz — Homepage section.
//
// Importers:
//   - src/app/page.tsx (Reviews'ten sonra mount)
// Glob check: src/components/sections/LoyaltySection.tsx daha once yoktu.
// User verbatim: "3 kart: Puan Kazan / Tier Yukseliş / Referans Bonusu; CTA '/hesabim'"

import Link from "next/link";
import { Sparkles, Crown, Gift, ChevronRight } from "lucide-react";
import { LOYALTY_CONFIG } from "@/data/loyalty";

const PERKS = [
  {
    title: "Puan Kazan",
    desc: `Her €${LOYALTY_CONFIG.earnRate} harcamada ${LOYALTY_CONFIG.earnRate} puan. ${LOYALTY_CONFIG.redemptionRate} puan = €1 indirim.`,
    icon: Sparkles,
    color: "bg-amber-100 text-amber-700",
  },
  {
    title: "Tier Yukseliş",
    desc: `Silver ${LOYALTY_CONFIG.tiers[1].min}+ · Gold ${LOYALTY_CONFIG.tiers[2].min}+ · Platinum ${LOYALTY_CONFIG.tiers[3].min}+ puan. Otomatik %${LOYALTY_CONFIG.tiers[3].discount}'e kadar indirim.`,
    icon: Crown,
    color: "bg-violet-100 text-violet-700",
  },
  {
    title: "Referans Bonusu",
    desc: `Davet ettiginiz her arkadasla siz +${LOYALTY_CONFIG.referralBonus} puan, arkadasiniz da +${LOYALTY_CONFIG.referralBonus} puan kazaniyor.`,
    icon: Gift,
    color: "bg-rose-100 text-rose-700",
  },
];

export function LoyaltySection() {
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-amber-50 via-white to-rose-50">
      <div className="container-main">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Sadakat Programi
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
            Her rezervasyon, bir sonraki tatile yatirim
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Trip and Tick uzerinden yaptiginiz her odeme puan kazandirir. Puanlarinizla indirim
            kullanin, tier yukseltin, arkadaslarinizi davet ederek ekstra puan kazanin.
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
            Puanlarima Bak <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/balonlar"
            className="inline-flex items-center gap-2 bg-white border-2 border-amber-300 text-amber-700 font-bold px-6 py-3 rounded-xl hover:bg-amber-50 transition-colors"
          >
            Hemen Rezervasyon Yap
          </Link>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Hosgeldin bonusu: Ilk rezervasyonda +{LOYALTY_CONFIG.firstBookingBonus} puan.
          Yorum bonusu: +{LOYALTY_CONFIG.reviewBonus} puan. Mobil uygulama: +{LOYALTY_CONFIG.appDownloadBonus} puan.
        </p>
      </div>
    </section>
  );
}
