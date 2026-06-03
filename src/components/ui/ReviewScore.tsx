"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiText, type UiText } from "@/lib/i18n/uiText";

/**
 * Booking.com review-skor rozeti.
 * format="ten": 5-yildiz rating'i /10'a maplar (otel kartlari, booking imzasi).
 * format="stars": yildiz gosterimi (balon/tur — mevcut dil korunur).
 */
interface ReviewScoreProps {
  /** 0-5 arasi kaynak rating (catalog standardi). */
  rating: number;
  count?: number;
  format?: "ten" | "stars";
  size?: "sm" | "md";
  className?: string;
}

function scoreWord(outOfTen: number, ui: UiText): string {
  if (outOfTen >= 9) return ui.reviewScore.excellent;
  if (outOfTen >= 8) return ui.reviewScore.veryGood;
  if (outOfTen >= 7) return ui.reviewScore.good;
  return ui.reviewScore.nice;
}

export function ReviewScore({
  rating,
  count,
  format = "ten",
  size = "md",
  className,
}: ReviewScoreProps) {
  const ui = useUiText();
  if (format === "stars") {
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
        <span className="font-bold text-slate-800">{rating.toFixed(1)}</span>
        {count != null && <span className="text-sm text-slate-500">({count})</span>}
      </span>
    );
  }

  const outOfTen = Math.round(rating * 2 * 10) / 10;
  const label = scoreWord(outOfTen, ui);
  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      aria-label={`${ui.reviewScore.ratingLabel} ${outOfTen} / 10 — ${label}${count != null ? `, ${count} ${ui.reviewScore.reviews}` : ""}`}
    >
      <span className={cn("score-badge", size === "md" ? "text-sm" : "text-xs")}>
        {outOfTen.toFixed(1)}
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-slate-800">{label}</span>
        {count != null && (
          <span className="block text-xs text-slate-500">{count} {ui.reviewScore.reviews}</span>
        )}
      </span>
    </span>
  );
}
