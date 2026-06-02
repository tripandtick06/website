import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/** Booking-tarzi input. Focus ring booking-blue (emil/impeccable). Hatada border-danger. */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const baseInput =
  "w-full px-4 py-3 border-2 rounded-booking text-[15px] font-medium text-slate-800 " +
  "placeholder:text-slate-400 outline-none transition-colors bg-white " +
  "focus-visible:ring-2 focus-visible:ring-booking/[0.35]";

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        baseInput,
        invalid ? "border-danger focus:border-danger" : "border-slate-200 focus:border-booking",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        baseInput,
        "resize-y min-h-[88px]",
        invalid ? "border-danger focus:border-danger" : "border-slate-200 focus:border-booking",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
