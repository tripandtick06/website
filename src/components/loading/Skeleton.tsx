// Reusable skeleton placeholders — SSR-safe pure-CSS (animate-pulse).
// No client hooks; can render in server components.

import { cn } from "@/lib/utils";

type BaseProps = {
  className?: string;
};

export function SkeletonBlock({ className }: BaseProps) {
  return (
    <div
      className={cn(
        "bg-slate-200 rounded animate-pulse",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className }: BaseProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white shadow-card overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      <div className="h-44 bg-slate-200 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-slate-200 rounded animate-pulse w-full" />
        <div className="h-3 bg-slate-200 rounded animate-pulse w-5/6" />
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="h-6 bg-slate-200 rounded animate-pulse w-1/3" />
          <div className="h-9 bg-slate-200 rounded animate-pulse w-24" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonHero({ className }: BaseProps) {
  return (
    <div
      className={cn(
        "w-full max-w-3xl mx-auto px-4 py-10 space-y-5",
        className,
      )}
      aria-hidden="true"
    >
      <div className="h-7 w-40 bg-slate-200 rounded-full animate-pulse mx-auto" />
      <div className="h-12 sm:h-14 bg-slate-200 rounded-lg animate-pulse w-5/6 mx-auto" />
      <div className="h-12 sm:h-14 bg-slate-200 rounded-lg animate-pulse w-2/3 mx-auto" />
      <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2 mx-auto" />
      <div className="h-14 bg-slate-200 rounded-2xl animate-pulse w-full max-w-xl mx-auto mt-6" />
    </div>
  );
}

type SkeletonTextProps = BaseProps & {
  lines?: number;
};

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  const safe = Math.max(1, Math.min(lines, 12));
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: safe }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3 bg-slate-200 rounded animate-pulse",
            i === safe - 1 ? "w-4/6" : i % 2 === 0 ? "w-full" : "w-5/6",
          )}
        />
      ))}
    </div>
  );
}
