import { cn } from "@/lib/utils";

/**
 * Form alan kabugu: label USTTE, hint, error ALTTA (impeccable form kurali).
 * placeholder-as-label YASAK.
 */
interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, required, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-danger" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
