"use client";

import { useT } from "@/lib/i18n/I18nProvider";

type Stat = { num: string; label: string };

export function StatsBar({ stats }: { stats?: Stat[] }) {
  const t = useT();

  // If no prop override, build from i18n dictionary.
  const finalStats: Stat[] =
    stats ?? [
      { num: "9+", label: t.stats.operators },
      { num: "12.000+", label: t.stats.customers },
      { num: "4.9", label: t.stats.rating },
      { num: "%100", label: t.stats.refund },
      { num: "9", label: t.stats.langs },
    ];

  return (
    <div className="bg-white border-b border-slate-200 py-7">
      <div className="container-main flex flex-wrap justify-center gap-8 sm:gap-14">
        {finalStats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-primary">
              {stat.num}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsBar;
