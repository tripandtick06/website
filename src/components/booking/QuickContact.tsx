"use client";

// Her sayfada ust kisimda erisilebilir iletisim: form + WhatsApp + e-posta.
// Sahiplik karari (2026-10-11): bu uc aksiyon header'da (QuickContactHeader) ve hero'daki
// kartta (QuickContactCard) yasar; baska yerde ikinci kopya EKLEME. Kilit:
// tests/lib/quick-contact.test.ts.
//
// Importers (callers):
//   - src/components/layout/Header.tsx            (QuickContactHeader — her sayfa)
//   - src/components/layout/PageHero.tsx          (QuickContactCard — hero'lu sayfalar)
//   - src/components/sections/HeroSection.tsx     (QuickContactCard — anasayfa)
// Lead hatti: POST /api/contact (Telegram + Brevo + Supabase leads) — yeni endpoint YOK.
// WhatsApp: buildWhatsAppHref + reportClick (FAB ile ayni atif/Telegram akisi).

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Loader2, Mail, MessageSquareText, Send, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { useUiText } from "@/lib/i18n/uiText";
import { buildWhatsAppHref, whatsappPrefill, sitePageUrl } from "@/lib/whatsapp";
import { reportClick, WhatsAppIcon } from "@/components/booking/WhatsAppFAB";
import { COMPANY } from "@/data/founder";

export const QUICK_CONTACT_ID = "quick-contact";

type Status = "idle" | "loading" | "success" | "error";

function currentProduct(): string | undefined {
  return document.querySelector<HTMLElement>("[data-tt-product]")?.dataset.ttProduct || undefined;
}

function humanize(slug: string): string {
  return slug.replace(/-/g, " ");
}

function useContactLinks() {
  const { locale } = useLocale();
  const pathname = usePathname() ?? "/";
  const waHref = buildWhatsAppHref(locale, pathname);
  const mailHref = `mailto:${COMPANY.email}?subject=${encodeURIComponent("Trip and Tick")}&body=${encodeURIComponent(
    `${whatsappPrefill(locale)}\n\n${sitePageUrl(pathname)}`,
  )}`;
  return { locale, pathname, waHref, mailHref };
}

export function QuickContactForm({ onSent }: { onSent?: () => void }) {
  const ui = useUiText().quickContact;
  const { pathname, locale, waHref, mailHref } = useContactLinks();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [product, setProduct] = useState<string | undefined>();

  useEffect(() => {
    setProduct(currentProduct());
  }, [pathname]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (data._hp) return; // bot: sessizce yut (sunucu da ayni davranir)
    const phone = (data.phone ?? "").trim();
    const email = (data.email ?? "").trim();
    if (!phone && !email) {
      setStatus("error");
      setError(ui.needOne);
      return;
    }
    setStatus("loading");
    const prod = currentProduct();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone,
          email,
          date: data.date || undefined,
          people: data.people || undefined,
          message: data.message || undefined,
          subject: prod ? `Hızlı talep — ${prod}` : "Hızlı talep",
          page: `${pathname} (${locale})`,
          _hp: data._hp,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
      form.reset();
      onSent?.();
    } catch {
      setStatus("error");
      setError(ui.error);
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="flex gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
        <p>{ui.success}</p>
      </div>
    );
  }

  const field = "input-field !py-2.5 !text-sm";
  return (
    <form onSubmit={submit} className="space-y-2.5" data-quick-contact-form>
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {product && (
        <p className="truncate rounded-lg bg-primary/[0.06] px-3 py-1.5 text-xs font-semibold capitalize text-primary">
          {humanize(product)}
        </p>
      )}
      <input name="name" type="text" required minLength={2} maxLength={100} autoComplete="name" aria-label={ui.name} placeholder={ui.name} className={field} />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <input name="phone" type="tel" maxLength={40} autoComplete="tel" inputMode="tel" aria-label={ui.phone} placeholder={ui.phone} className={field} />
        <input name="email" type="email" maxLength={200} autoComplete="email" aria-label={ui.email} placeholder={ui.email} className={field} />
      </div>
      <details className="group">
        <summary className="cursor-pointer select-none text-xs font-semibold text-primary">{ui.more}</summary>
        <div className="mt-2.5 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <input name="date" type="date" aria-label={ui.date} title={ui.date} className={field} />
            <input name="people" type="number" min={1} max={99} inputMode="numeric" aria-label={ui.people} placeholder={ui.people} className={field} />
          </div>
          <textarea name="message" rows={2} maxLength={2000} aria-label={ui.message} placeholder={ui.message} className={`${field} resize-none`} />
        </div>
      </details>
      <button type="submit" disabled={status === "loading"} className="btn-accent flex w-full items-center justify-center gap-2 !py-2.5 text-sm disabled:opacity-60">
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {ui.sending}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> {ui.send}
          </>
        )}
      </button>
      {status === "error" && (
        <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
          <p>{error}</p>
          <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
            <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={() => reportClick(pathname, locale)} className="underline">
              WhatsApp
            </a>
            <a href={mailHref} className="underline">
              {COMPANY.email}
            </a>
          </p>
        </div>
      )}
    </form>
  );
}

// Hero karti — site kartlari gibi beyaz/yuvarlak; header "Talep" dugmesi buraya kayar.
export function QuickContactCard({ className = "" }: { className?: string }) {
  const ui = useUiText().quickContact;
  return (
    <section
      id={QUICK_CONTACT_ID}
      aria-label={ui.title}
      className={`w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-elevated ${className}`}
    >
      <h2 className="text-lg font-extrabold text-primary">{ui.title}</h2>
      <p className="mb-3 text-sm text-slate-500">{ui.subtitle}</p>
      <QuickContactForm />
    </section>
  );
}

// Header aksiyonlari: Talep (kart varsa oraya kayar, yoksa panel acar) + WhatsApp + E-posta.
export function QuickContactHeader() {
  const ui = useUiText().quickContact;
  const { pathname, locale, waHref, mailHref } = useContactLinks();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (ev: MouseEvent | TouchEvent) => {
      const t = ev.target as Node | null;
      if (t && wrapRef.current && !wrapRef.current.contains(t)) setOpen(false);
    };
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onForm = useCallback(() => {
    const card = document.getElementById(QUICK_CONTACT_ID);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.querySelector<HTMLInputElement>("input[name=name]")?.focus({ preventScroll: true });
      return;
    }
    setOpen((v) => !v);
  }, []);

  const btn =
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg text-white/85 hover:bg-white/[0.1] hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-booking/[0.5]";

  return (
    <div ref={wrapRef} className="flex items-center gap-1" data-quick-contact-actions>
      <button type="button" onClick={onForm} aria-expanded={open} aria-label={ui.formBtn} title={ui.formBtn} className={`${btn} w-9 2xl:w-auto 2xl:px-3 2xl:text-sm 2xl:font-semibold`}>
        <MessageSquareText className="h-[18px] w-[18px]" />
        <span className="hidden 2xl:inline">{ui.formBtn}</span>
      </button>
      <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp" onClick={() => reportClick(pathname, locale)} className={`${btn} w-9 !text-[#25D366]`}>
        <WhatsAppIcon className="h-[19px] w-[19px]" />
      </a>
      <a href={mailHref} aria-label={ui.mail} title={ui.mail} className={`${btn} w-9`}>
        <Mail className="h-[18px] w-[18px]" />
      </a>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 max-h-[calc(100dvh-68px)] overflow-y-auto px-4 pt-2 pb-4">
          <div className="container-main flex justify-end !px-0">
            <section className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated" aria-label={ui.title}>
              <button type="button" onClick={() => setOpen(false)} aria-label={ui.close} title={ui.close} className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
              <h2 className="pr-8 text-lg font-extrabold text-primary">{ui.title}</h2>
              <p className="mb-3 text-sm text-slate-500">{ui.subtitle}</p>
              <QuickContactForm />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
