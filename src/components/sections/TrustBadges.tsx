"use client";

import NextImage from "next/image";
import { ShieldCheck, Wallet, Users } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";

const PILL =
  "flex items-center gap-2 bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-full px-4 py-2 text-white/90 text-xs sm:text-sm font-medium";

// Anasayfa hero guven satiri; /turlar + /transferler PageHero'da ayni bilesen (compact: "9+ Operatör" yok).
export function TrustBadges({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const t = useT();
  return (
    <div className={`relative flex flex-wrap items-center justify-center gap-3 sm:gap-5 ${className}`}>
      <div className={PILL}>
        <Wallet className="w-4 h-4 text-accent-light shrink-0" />
        <span>{t.hero_trust.refund}</span>
      </div>
      <div className={PILL}>
        <ShieldCheck className="w-4 h-4 text-accent-light shrink-0" />
        <span>{t.hero_trust.insurance}</span>
      </div>
      {!compact && (
        <div className={PILL}>
          <Users className="w-4 h-4 text-accent-light shrink-0" />
          <span>{t.hero_trust.operators}</span>
        </div>
      )}
      <div className={PILL}>
        <span className="flex items-center justify-center bg-white rounded-full p-0.5 shrink-0">
          <NextImage src="/images/tursab.png" alt="TÜRSAB üyesi operatörler" width={20} height={20} className="h-5 w-5" />
        </span>
        <span>{t.hero_trust.tursab}</span>
      </div>
    </div>
  );
}
