import Link from "next/link";
import { Star, Clock, Check, Hotel, Bike, TreePine, Package, Car, Wind } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ServiceItem } from "@/data/services/catalog";

const CATEGORY_ICON: Record<ServiceItem["category"], typeof Wind> = {
  activity: Bike,
  tour: TreePine,
  hotel: Hotel,
  package: Package,
  transfer: Car,
};

const CATEGORY_GRADIENT: Record<ServiceItem["category"], string> = {
  activity: "from-success/80 to-success",
  tour: "from-primary to-primary-light",
  hotel: "from-warning/80 to-warning",
  package: "from-accent to-accent-light",
  transfer: "from-slate-600 to-slate-700",
};

export interface ServiceCardProps {
  item: ServiceItem;
  ctaHref?: string;
}

export function ServiceCard({ item, ctaHref }: ServiceCardProps) {
  const Icon = CATEGORY_ICON[item.category];
  const gradient = CATEGORY_GRADIENT[item.category];
  const href = ctaHref || `/rezervasyon/${item.slug}`;

  return (
    <article className="card overflow-hidden flex flex-col h-full">
      {/* Hero / Icon area */}
      <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <Icon className="w-20 h-20 text-white/85" strokeWidth={1.4} />
        {item.badge && (
          <span className="absolute top-3 left-3 bg-white text-primary px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide shadow-sm">
            {item.badge}
          </span>
        )}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-primary px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
          <Star className="w-3 h-3 fill-warning text-warning" />
          {item.rating}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-slate-900 mb-1.5 leading-snug">
          {item.name}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-3 flex-1">
          {item.shortDescription}
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {item.duration}
          </span>
          <span>·</span>
          <span>{item.reviewCount.toLocaleString("tr-TR")} değerlendirme</span>
        </div>

        <ul className="text-xs text-slate-600 space-y-1 mb-4">
          {item.includes.slice(0, 3).map((inc) => (
            <li key={inc} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
              <span>{inc}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-end justify-between gap-3 mt-auto pt-3 border-t border-slate-100">
          <div>
            {item.marketPrice && item.marketPrice > item.adultPrice && (
              <div className="text-xs text-slate-400 line-through leading-none mb-0.5">
                {formatPrice(item.marketPrice, item.currency)}
              </div>
            )}
            <div className="text-2xl font-extrabold text-primary leading-none">
              {formatPrice(item.adultPrice, item.currency)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">kişi başı</div>
          </div>
          <Link
            href={href}
            className="btn-accent text-sm !py-2 !px-4 flex-shrink-0"
          >
            Rezervasyon
          </Link>
        </div>
      </div>
    </article>
  );
}
