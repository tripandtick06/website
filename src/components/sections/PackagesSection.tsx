import {
  Clock,
  Users,
  Star,
  Wind,
  Heart,
  Zap,
  Check,
  ArrowRight,
} from "lucide-react";

interface PackageCardProps {
  badge: string;
  badgeColor: "accent" | "success" | "warning";
  title: string;
  meta: { icon: React.ReactNode; text: string }[];
  includes: string[];
  marketPrice: number;
  price: number;
  unit: string;
  gradient: string;
  icon: React.ReactNode;
}

function PackageCard({
  badge,
  badgeColor,
  title,
  meta,
  includes,
  marketPrice,
  price,
  unit,
  gradient,
  icon,
}: PackageCardProps) {
  const badgeColors = {
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
  };

  return (
    <div className="card overflow-hidden group">
      {/* Image Area */}
      <div className={`h-52 relative ${gradient} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
        <div className="opacity-20 group-hover:opacity-30 transition-opacity">{icon}</div>
        <span
          className={`absolute top-4 left-4 ${badgeColors[badgeColor]} text-white px-3 py-1 rounded-lg text-xs font-bold z-10`}
        >
          {badge}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-lg font-extrabold text-slate-900 mb-2">{title}</h3>

        <div className="flex gap-4 mb-3">
          {meta.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
              {m.icon}
              {m.text}
            </div>
          ))}
        </div>

        <div className="space-y-1.5 mb-5">
          {includes.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
              <Check className="w-4 h-4 text-success shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <div className="text-sm text-slate-400 line-through">Piyasa: €{marketPrice}</div>
            <div className="text-2xl font-black text-primary">€{price}</div>
            <div className="text-xs text-slate-500">{unit}</div>
          </div>
          <button className="btn-accent flex items-center gap-2 !text-sm !py-2.5 !px-5">
            Rezervasyon <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PackagesSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-main">
        <div className="text-center mb-12">
          <span className="section-tag">Öne Çıkan Paketler</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            En Çok Tercih Edilenler
          </h2>
          <p className="text-slate-500 mt-3 max-w-md mx-auto">
            Rakip fiyatları karşılaştırdık, en iyi teklifleri sizin için seçtik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 max-w-[1200px] mx-auto">
          <PackageCard
            badge="En Popüler"
            badgeColor="accent"
            title="Standart Balon Uçuşu"
            meta={[
              { icon: <Clock className="w-4 h-4" />, text: "60+ dk" },
              { icon: <Users className="w-4 h-4" />, text: "16-20 kişi" },
              { icon: <Star className="w-4 h-4" />, text: "4.9" },
            ]}
            includes={[
              "Otelden transfer dahil",
              "Hafif kahvaltı dahil",
              "40M€ sigorta dahil",
              "Sertifika & madalya",
              "Şampanya ile kutlama",
            ]}
            marketPrice={200}
            price={165}
            unit="kişi başı"
            gradient="bg-gradient-to-br from-primary to-accent"
            icon={<Wind className="w-24 h-24 text-white" />}
          />

          <PackageCard
            badge="Deluxe"
            badgeColor="warning"
            title="Romantik Balayı Paketi"
            meta={[
              { icon: <Wind className="w-4 h-4" />, text: "Özel balon" },
              { icon: <Clock className="w-4 h-4" />, text: "2 gece otel" },
              { icon: <Star className="w-4 h-4" />, text: "5.0" },
            ]}
            includes={[
              "Özel deluxe balon uçuşu",
              "Mağara otel (2 gece)",
              "VIP transfer",
              "Sürpriz çiçek & dekor",
              "Özel fotoğraf çekimi",
            ]}
            marketPrice={680}
            price={560}
            unit="2 kişi toplam"
            gradient="bg-gradient-to-br from-[#4A1A8B] to-accent"
            icon={<Heart className="w-24 h-24 text-white" />}
          />

          <PackageCard
            badge="Macera"
            badgeColor="success"
            title="Macera Paketi (2 Gün)"
            meta={[
              { icon: <Wind className="w-4 h-4" />, text: "Balon" },
              { icon: <Zap className="w-4 h-4" />, text: "ATV" },
              { icon: <Star className="w-4 h-4" />, text: "4.8" },
            ]}
            includes={[
              "Standart balon uçuşu",
              "2 saatlik ATV turu",
              "1 saatlik at binme",
              "Tüm transferler dahil",
              "Rehber eşliği",
            ]}
            marketPrice={280}
            price={229}
            unit="kişi başı"
            gradient="bg-gradient-to-br from-[#1A6B2B] to-[#4BBE6A]"
            icon={<Zap className="w-24 h-24 text-white" />}
          />
        </div>
      </div>
    </section>
  );
}
