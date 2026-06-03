// Availability rozeti — üç renk: yeşil (müsait) / sarı (limited) / kırmızı (dolu).
//
// Importers:
//   - src/app/rezervasyon/[slug]/BookingClient.tsx (Step 2 doluluk sinyal)
//   - src/app/admin/page.tsx (Takvim hücre rozeti)
// Affected: rezervasyon flow + admin takvim görsel.
// Data: Props { status: AvailabilityStatus, remainingSlots?: number, className?, size? }.
// User verbatim: "doluluk oranlarini bizim elden ayarlayabilmemiz gerekiyor.
// mesela balon turunda veya atv yada at turunda doluluk oldugunda musteriye
// odeme yaptirmadan once bunu bilgilendirebilmemiz gerekiyor. bunun icinde
// elden de ayarlama yapabilmemiz gerekiyor."

"use client";

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/I18nProvider";
import { useUiText } from "@/lib/i18n/uiText";
import type { AvailabilityStatus } from "@/data/availability";

export interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  remainingSlots?: number;
  className?: string;
  size?: "sm" | "md";
}

export function AvailabilityBadge({
  status,
  remainingSlots,
  className,
  size = "md",
}: AvailabilityBadgeProps) {
  const t = useT();
  const ui = useUiText();
  const sizeCls =
    size === "sm" ? "text-xs px-2 py-0.5 gap-1" : "text-sm px-3 py-1 gap-1.5";
  const iconCls = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  if (status === "available") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 font-semibold",
          sizeCls,
          className
        )}
      >
        <CheckCircle2 className={iconCls} />
        {t.component.booking.availability_badge.musait}
      </span>
    );
  }

  if (status === "limited") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-amber-100 text-amber-800 font-semibold",
          sizeCls,
          className
        )}
      >
        <AlertTriangle className={iconCls} />
        {remainingSlots !== undefined
          ? ui.availability.lastSeats.replace("{n}", String(remainingSlots))
          : ui.availability.limited}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-rose-100 text-rose-700 font-semibold",
        sizeCls,
        className
      )}
    >
      <XCircle className={iconCls} />
      {ui.availability.soldOut}
    </span>
  );
}
