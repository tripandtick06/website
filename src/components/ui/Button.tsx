import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Booking.com-tarzi buton sistemi.
 * Renk disiplini: accent = primary CTA, booking = ikincil/link aksiyon,
 * primary(navy) = chrome aksiyon. (3-renk lock.)
 * emil: active:scale, ease-out-strong, focus ring; impeccable: kontrast AA.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap " +
    "rounded-booking transition-[transform,background-color,box-shadow] duration-150 " +
    "ease-out-strong active:scale-[0.98] focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-booking/[0.45] focus-visible:ring-offset-1 " +
    "disabled:opacity-60 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        accent: "bg-accent text-white shadow-glow hover:bg-accent-light",
        primary: "bg-primary text-white shadow-sm hover:bg-primary-light",
        booking: "bg-booking text-white shadow-sm hover:bg-booking-600",
        outline:
          "border-2 border-primary/[0.15] bg-white text-primary hover:border-booking hover:text-booking",
        ghost: "text-primary hover:bg-primary/[0.06]",
        link: "text-booking-600 underline-offset-2 hover:text-booking-700 hover:underline px-0",
        whatsapp: "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600",
        danger: "bg-danger text-white shadow-sm hover:bg-danger/90",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-[15px]",
        lg: "h-13 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "accent", size: "md" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    // asChild (Radix Slot) TEK child element ister — loader sibling'i eklenirse
    // React.Children.only patlar. Bu yuzden asChild dalinda yalniz children gecilir.
    if (asChild) {
      return (
        <Slot ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
          {children}
        </Slot>
      );
    }
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          // emil: yukleme genislik atlamasi yapmaz; ikon icerigin yerine gecer.
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
