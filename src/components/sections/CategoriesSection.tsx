import Link from "next/link";
import {
  Wind,
  Hotel,
  Car,
  Bike,
  TreePine,
  Package,
  PartyPopper,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  {
    icon: Wind,
    name: "Balon Turları",
    sub: "€165'ten başlayan",
    href: "/balonlar",
    featured: true,
  },
  { icon: Hotel, name: "Otel & Konaklama", sub: "Mağara otellerinden resort'lara", href: "/oteller" },
  { icon: Car, name: "Transfer", sub: "Havalimanı & Şehirlerarası", href: "/transferler" },
  { icon: Bike, name: "ATV Turları", sub: "$29'dan başlayan", href: "/aktiviteler" },
  { icon: TreePine, name: "Gezi Turları", sub: "Kırmızı & Yeşil Tur", href: "/turlar" },
  { icon: Package, name: "Özel Paketler", sub: "Balayı, teklif, doğum günü", href: "/paketler" },
  { icon: PartyPopper, name: "At Binme", sub: "Gün doğumu & batımı", href: "/aktiviteler" },
  { icon: Shield, name: "Seyahat Sigortası", sub: "Kapsamlı güvence", href: "#" },
];

export function CategoriesSection() {
  return (
    <section className="section-padding bg-slate-50">
      <div className="container-main">
        <div className="text-center mb-12">
          <span className="section-tag">Hizmetlerimiz</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Her Şey Tek Yerden
          </h2>
          <p className="text-slate-500 mt-3 max-w-md mx-auto">
            Uçak bileti hariç, Kapadokya&apos;da ihtiyacınız olan her seyahat hizmeti burada.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={cn(
                "group flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-300",
                cat.featured
                  ? "bg-gradient-to-br from-primary to-primary-light text-white border-transparent shadow-card"
                  : "bg-white border-slate-200 text-slate-800 hover:border-primary hover:-translate-y-1 hover:shadow-card"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                  cat.featured ? "bg-white/20" : "bg-primary/[0.08]"
                )}
              >
                <cat.icon className={cn("w-6 h-6", cat.featured ? "text-white" : "text-primary")} />
              </div>
              <span className="font-bold text-sm">{cat.name}</span>
              <span className={cn("text-xs mt-1", cat.featured ? "text-white/70" : "text-slate-400")}>
                {cat.sub}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
