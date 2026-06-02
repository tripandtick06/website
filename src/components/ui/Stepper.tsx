"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sayi sayaci (yetiskin/cocuk). SearchWidget + HotelInquiryForm'daki tekrar eden
 * +/- mantigini tek primitive'e cikarir. emil: active:scale, focus ring.
 */
interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export function Stepper({ value, onChange, min = 0, max = 99, label, className }: StepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  const btn =
    "h-9 w-9 inline-flex items-center justify-center rounded-full border-2 border-slate-200 " +
    "text-slate-700 transition-[transform,border-color,color] duration-150 ease-out-strong " +
    "active:scale-[0.92] hover:border-booking hover:text-booking disabled:opacity-40 " +
    "disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-booking/[0.4]";

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <button type="button" onClick={dec} disabled={value <= min} aria-label={`${label ?? ""} azalt`} className={btn}>
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <span className="min-w-[2ch] text-center text-base font-bold tabular-nums text-slate-800" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={inc} disabled={value >= max} aria-label={`${label ?? ""} artir`} className={btn}>
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
