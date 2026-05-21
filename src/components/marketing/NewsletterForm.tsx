"use client";

// Newsletter signup form — Brevo Contacts API integration via /api/newsletter.
//
// Importers:
//   - src/components/layout/Footer.tsx (variant="inline")
//   - src/components/sections/NewsletterSection.tsx (variant="block")
//   - future popup modals (variant="popup")
// Affected: lead capture for email marketing.
// Data: POST /api/newsletter { email, locale, source, _hp }
// User verbatim: "Compact inline form (email input + Subscribe button) + variants
// inline/block/popup, KVKK micro, honeypot, loading + success states."

import { useState, type FormEvent } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useLocale, useT } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

export type NewsletterVariant = "inline" | "block" | "popup";

interface NewsletterFormProps {
  variant?: NewsletterVariant;
  source?: string;
  className?: string;
  headline?: string;
  subline?: string;
}

type FormState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function NewsletterForm({
  variant = "inline",
  source,
  className,
  headline,
  subline,
}: NewsletterFormProps) {
  const t = useT();
  const COPY = {
    placeholder: t.component.marketing.newsletter_form.copy_placeholder,
    cta: t.component.marketing.newsletter_form.copy_cta,
    loading: t.component.marketing.newsletter_form.copy_loading,
    success: t.component.marketing.newsletter_form.copy_success,
    errorGeneric: t.component.marketing.newsletter_form.copy_error_generic,
    errorInvalid: t.component.marketing.newsletter_form.copy_error_invalid,
    kvkk: t.component.marketing.newsletter_form.copy_kvkk,
  };
  const { locale } = useLocale();
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status === "loading") return;

    if (honeypot.trim()) {
      // Bot — pretend success.
      setState({ status: "success", message: COPY.success });
      setEmail("");
      return;
    }

    if (!isValidEmail(email)) {
      setState({ status: "error", message: COPY.errorInvalid });
      return;
    }

    setState({ status: "loading" });
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          locale,
          source: source ?? variant,
          _hp: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && !data?.ok) {
        setState({
          status: "error",
          message: data?.error ?? COPY.errorGeneric,
        });
        return;
      }
      setState({ status: "success", message: COPY.success });
      setEmail("");
    } catch {
      setState({ status: "error", message: COPY.errorGeneric });
    }
  }

  // ---------------------------- BLOCK variant ---------------------------------
  if (variant === "block") {
    return (
      <div className={cn("w-full", className)}>
        {headline && (
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 text-center">
            {headline}
          </h2>
        )}
        {subline && (
          <p className="text-white/85 text-center text-sm sm:text-base mb-5">
            {subline}
          </p>
        )}
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2"
          aria-label={t.component.marketing.newsletter_form.form_aria_label_bulten_aboneligi}
        >
          {/* Honeypot */}
          <input
            type="text"
            name="_hp"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />
          <label className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={COPY.placeholder}
              disabled={state.status === "loading"}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60"
              aria-label={t.component.marketing.newsletter_form.aria_eposta}
            />
          </label>
          <button
            type="submit"
            disabled={state.status === "loading" || state.status === "success"}
            className="bg-slate-900 text-white font-bold px-5 py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {state.status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {COPY.loading}
              </>
            ) : (
              COPY.cta
            )}
          </button>
        </form>
        <FormFeedback state={state} dark />
        <p className="text-[11px] text-white/70 text-center mt-3">
          {COPY.kvkk}
        </p>
      </div>
    );
  }

  // ---------------------------- POPUP variant (future modal use) -------------
  if (variant === "popup") {
    return (
      <div className={cn("w-full bg-white rounded-2xl p-6 shadow-elevated", className)}>
        {headline && (
          <h3 className="text-xl font-extrabold text-slate-900 mb-1">{headline}</h3>
        )}
        {subline && <p className="text-sm text-slate-600 mb-4">{subline}</p>}
        <form onSubmit={handleSubmit} className="space-y-3" aria-label={t.component.marketing.newsletter_form.form_aria_label_bulten_aboneligi}>
          <input
            type="text"
            name="_hp"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={COPY.placeholder}
            disabled={state.status === "loading"}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm focus:outline-none focus:border-primary"
            aria-label="E-posta"
          />
          <button
            type="submit"
            disabled={state.status === "loading" || state.status === "success"}
            className="w-full bg-accent text-white font-bold px-4 py-3 rounded-xl hover:bg-accent/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {state.status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {COPY.loading}
              </>
            ) : (
              COPY.cta
            )}
          </button>
        </form>
        <FormFeedback state={state} />
        <p className="text-[11px] text-slate-500 mt-3">{COPY.kvkk}</p>
      </div>
    );
  }

  // ---------------------------- INLINE variant (default) ----------------------
  return (
    <div className={cn("w-full", className)}>
      {headline && (
        <h5 className="text-white font-bold text-sm mb-2">{headline}</h5>
      )}
      {subline && <p className="text-xs text-slate-400 mb-3">{subline}</p>}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2"
        aria-label={t.component.marketing.newsletter_form.form_aria_label_bulten_aboneligi}
      >
        <input
          type="text"
          name="_hp"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={COPY.placeholder}
          disabled={state.status === "loading"}
          className="flex-1 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-accent disabled:opacity-60"
          aria-label="E-posta"
        />
        <button
          type="submit"
          disabled={state.status === "loading" || state.status === "success"}
          className="bg-accent text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-accent/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {state.status === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {COPY.loading}
            </>
          ) : (
            COPY.cta
          )}
        </button>
      </form>
      <FormFeedback state={state} dark />
      <p className="text-[10px] text-slate-500 mt-2">{COPY.kvkk}</p>
    </div>
  );
}

function FormFeedback({ state, dark = false }: { state: FormState; dark?: boolean }) {
  if (state.status === "success") {
    return (
      <p
        className={cn(
          "mt-3 flex items-center gap-2 text-xs",
          dark ? "text-emerald-300" : "text-emerald-700"
        )}
        role="status"
      >
        <CheckCircle2 className="w-4 h-4" />
        {state.message}
      </p>
    );
  }
  if (state.status === "error") {
    return (
      <p
        className={cn(
          "mt-3 flex items-center gap-2 text-xs",
          dark ? "text-rose-300" : "text-rose-700"
        )}
        role="alert"
      >
        <AlertCircle className="w-4 h-4" />
        {state.message}
      </p>
    );
  }
  return null;
}
