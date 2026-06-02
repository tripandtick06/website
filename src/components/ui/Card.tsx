import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Booking property-card kabugu. variant=booking: navy-tonlu golge + sıkı kose.
 * interactive: hover lift (emil ease-out). Server-safe.
 */
const cardVariants = cva("bg-white overflow-hidden", {
  variants: {
    variant: {
      default: "rounded-2xl border border-slate-200",
      booking: "rounded-booking border border-slate-200 shadow-booking-card",
      interactive:
        "rounded-booking border border-slate-200 shadow-booking-card " +
        "transition-[transform,box-shadow] duration-200 ease-out-strong " +
        "hover:-translate-y-0.5 hover:shadow-booking-hover",
    },
  },
  defaultVariants: { variant: "booking" },
});

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
  )
);
Card.displayName = "Card";

function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5 pt-0", className)} {...props} />;
}

export { Card, CardBody, CardFooter, cardVariants };
