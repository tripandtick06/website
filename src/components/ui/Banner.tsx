import { Info, TriangleAlert, CheckCircle2 } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Bilgi/uyari/basari banner'i. impeccable: side-stripe YASAK — tam border + bg tint
 * + leading icon. info=booking-blue (otel "online rezervasyon yakinda" mesaji).
 */
const bannerVariants = cva("flex items-start gap-3 rounded-booking border p-4", {
  variants: {
    variant: {
      info: "border-booking-100 bg-booking-50 text-booking-700",
      warning: "border-amber-200 bg-amber-50 text-amber-900",
      success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
  },
  defaultVariants: { variant: "info" },
});

const icons = {
  info: Info,
  warning: TriangleAlert,
  success: CheckCircle2,
} as const;

interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  title?: string;
}

export function Banner({ className, variant = "info", title, children, ...props }: BannerProps) {
  const Icon = icons[variant ?? "info"];
  return (
    <div className={cn(bannerVariants({ variant }), className)} {...props}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="text-sm leading-relaxed">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5 opacity-90")}>{children}</div>}
      </div>
    </div>
  );
}

export { bannerVariants };
