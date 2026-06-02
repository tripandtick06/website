import { cn } from "@/lib/utils";

/** Shimmer skeleton — loading.tsx ve liste yukleme durumlari (emil perceived perf). */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton", className)} aria-hidden {...props} />;
}
