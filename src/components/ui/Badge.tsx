import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Etiket rozeti — tier / "Tercih edilen" / durum. 3-renk lock'a sadik. */
const badgeVariants = cva(
  "inline-flex items-center gap-1 font-semibold rounded-full leading-none",
  {
    variants: {
      variant: {
        neutral: "bg-slate-100 text-slate-700",
        navy: "bg-primary/[0.08] text-primary",
        booking: "bg-booking/[0.10] text-booking-700",
        accent: "bg-accent/[0.12] text-accent-dark",
        success: "bg-emerald-100 text-emerald-700",
        warning: "bg-amber-100 text-amber-800",
        danger: "bg-rose-100 text-rose-700",
        outline: "border border-slate-300 text-slate-600",
      },
      size: {
        sm: "text-[11px] px-2 py-0.5",
        md: "text-xs px-2.5 py-1",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
