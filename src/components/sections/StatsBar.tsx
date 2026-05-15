type Stat = { num: string; label: string };

const DEFAULT_STATS: Stat[] = [
  { num: "9+", label: "Anlaşmalı Operatör" },
  { num: "12.000+", label: "Mutlu Yolcu" },
  { num: "4.9", label: "Ortalama Puan" },
  { num: "%100", label: "İade Garantisi" },
  { num: "9", label: "Dil Desteği" },
];

export function StatsBar({ stats = DEFAULT_STATS }: { stats?: Stat[] }) {
  return (
    <div className="bg-white border-b border-slate-200 py-7">
      <div className="container-main flex flex-wrap justify-center gap-8 sm:gap-14">
        {stats.map((stat) => (
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
