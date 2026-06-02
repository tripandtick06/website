import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Olanak chip listesi + "+N daha" tasma (impeccable: uzun liste != uzun ul). */
interface AmenityChipsProps {
  items: string[];
  max?: number;
  className?: string;
}

export function AmenityChips({ items, max = 6, className }: AmenityChipsProps) {
  if (!items?.length) return null;
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {shown.map((item) => (
        <li key={item} className="chip">
          <Check className="h-3.5 w-3.5 text-booking-600" aria-hidden />
          {item}
        </li>
      ))}
      {rest > 0 && <li className="chip font-semibold text-slate-700">+{rest} daha</li>}
    </ul>
  );
}
