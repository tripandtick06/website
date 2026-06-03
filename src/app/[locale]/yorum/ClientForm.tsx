// Yorum gonderme formu — client component.
//
// Importers: src/app/yorum/page.tsx
// Affected: musteri yorum submit; POST /api/yorum
// Data: form alanlari -> submitSchema (api/yorum/route.ts) ile birebir uyusur:
//   { name, email, phone?, serviceSlug, serviceName, rating 1-5, title,
//     message (50-2000), language, _hp honeypot }
// User verbatim: "devam et"

"use client";

import { useMemo, useState } from "react";
import { Star, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BALLOON_PACKAGES } from "@/data/services/balloons";
import { ACTIVITIES, TOURS } from "@/data/services/catalog";
import { useT, useLocale } from "@/lib/i18n/I18nProvider";
import { PhoneField, dialForLocale } from "@/components/booking/PhoneField";
import { Link } from "@/i18n/routing";
import { tNodes } from "@/lib/i18n/trans";

interface ServiceOption {
  slug: string;
  name: string;
  category: string;
}

const LANGUAGES = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "nl", label: "Nederlands" },
];

type Status = "idle" | "submitting" | "success" | "error";

export function ClientForm() {
  const t = useT();
  const { locale } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceSlug, setServiceSlug] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("tr");
  const [kvkk, setKvkk] = useState(false);
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);

  const SERVICE_OPTIONS: ServiceOption[] = useMemo(
    () => [
      ...BALLOON_PACKAGES.map((p) => ({ slug: p.slug, name: p.name, category: t.component.yorum.review_form.category_balloon })),
      ...ACTIVITIES.map((a) => ({ slug: a.slug, name: a.name, category: t.component.yorum.review_form.category_activity })),
      ...TOURS.map((tour) => ({ slug: tour.slug, name: tour.name, category: t.component.yorum.review_form.category_tour })),
    ],
    [t]
  );

  const selectedService = useMemo(
    () => SERVICE_OPTIONS.find((s) => s.slug === serviceSlug),
    [serviceSlug, SERVICE_OPTIONS]
  );

  const messageLen = message.length;
  const messageOk = messageLen >= 50 && messageLen <= 2000;
  const titleOk = title.length >= 5;
  const formOk =
    name.length >= 2 &&
    /\S+@\S+\.\S+/.test(email) &&
    !!serviceSlug &&
    titleOk &&
    messageOk &&
    kvkk;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formOk || status === "submitting") return;
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/yorum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          serviceSlug,
          serviceName: selectedService?.name ?? serviceSlug,
          rating,
          title,
          message,
          language,
          _hp: hp,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? t.component.yorum.review_form.error_status.replace("{status}", String(res.status)));
      }
      const data = (await res.json()) as { reviewId: string };
      setReviewId(data.reviewId);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : t.component.yorum.review_form.error_unknown);
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {t.component.yorum.review_form.success_title}
        </h2>
        <p className="text-slate-600 mb-2">
          {tNodes(t.component.yorum.review_form.success_body, {
            hours: <strong>{t.component.yorum.review_form.success_body_hours}</strong>,
          })}
        </p>
        {reviewId && (
          <p className="text-xs text-slate-400 mt-2">
            {t.component.yorum.review_form.reference_no} <code>{reviewId}</code>
          </p>
        )}
        <button
          onClick={() => {
            setStatus("idle");
            setName("");
            setEmail("");
            setPhone("");
            setServiceSlug("");
            setRating(5);
            setTitle("");
            setMessage("");
            setKvkk(false);
            setReviewId(null);
          }}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm"
        >
          {t.component.yorum.review_form.new_review_button}
        </button>
      </div>
    );
  }

  const inputCls =
    "w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-5"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label={t.component.yorum.review_form.label_name}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={80}
            className={inputCls}
            placeholder={t.component.yorum.review_form.placeholder_name}
          />
        </FormField>
        <FormField label={t.component.yorum.review_form.label_email}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputCls}
            placeholder="ornek@email.com"
          />
        </FormField>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <PhoneField label={t.component.yorum.review_form.label_phone} value={phone} onChange={setPhone} defaultDial={dialForLocale(locale)} />
        <FormField label={t.component.yorum.review_form.label_language}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={inputCls}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label={t.component.yorum.review_form.label_service}>
        <select
          value={serviceSlug}
          onChange={(e) => setServiceSlug(e.target.value)}
          required
          className={inputCls}
        >
          <option value="">{t.component.yorum.review_form.service_placeholder}</option>
          <optgroup label={t.component.yorum.review_form.optgroup_balloon}>
            {SERVICE_OPTIONS.filter((s) => s.category === t.component.yorum.review_form.category_balloon).map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </optgroup>
          <optgroup label={t.component.yorum.review_form.optgroup_activity}>
            {SERVICE_OPTIONS.filter((s) => s.category === t.component.yorum.review_form.category_activity).map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </optgroup>
          <optgroup label={t.component.yorum.review_form.optgroup_tour}>
            {SERVICE_OPTIONS.filter((s) => s.category === t.component.yorum.review_form.category_tour).map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </optgroup>
        </select>
      </FormField>

      <FormField label={t.component.yorum.review_form.label_rating}>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={t.component.yorum.review_form.aria_star.replace("{n}", String(n))}
              className="p-1"
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  n <= rating
                    ? "text-amber-500 fill-amber-500"
                    : "text-slate-300"
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-slate-700">
            {rating}/5
          </span>
        </div>
      </FormField>

      <FormField label={t.component.yorum.review_form.label_title}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={5}
          maxLength={120}
          className={inputCls}
          placeholder={t.component.yorum.review_form.placeholder_title}
        />
        {title.length > 0 && !titleOk && (
          <p className="text-xs text-rose-500 mt-1">{t.component.yorum.review_form.error_title_min}</p>
        )}
      </FormField>

      <FormField label={t.component.yorum.review_form.label_message.replace("{count}", String(messageLen))}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={6}
          minLength={50}
          maxLength={2000}
          className={cn(inputCls, "resize-y")}
          placeholder={t.component.yorum.review_form.placeholder_message}
        />
        {message.length > 0 && !messageOk && (
          <p className="text-xs text-rose-500 mt-1">
            {messageLen < 50
              ? t.component.yorum.review_form.error_message_min.replace("{remaining}", String(50 - messageLen))
              : t.component.yorum.review_form.error_message_max}
          </p>
        )}
      </FormField>

      <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={kvkk}
          onChange={(e) => setKvkk(e.target.checked)}
          className="mt-1 w-4 h-4"
          required
        />
        <span>
          <Link href="/kvkk" className="text-amber-600 underline" target="_blank">
            KVKK
          </Link>{" "}
          {t.component.yorum.review_form.kvkk_consent}
        </span>
      </label>

      <div className="hidden" aria-hidden>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
        />
      </div>

      {status === "error" && (
        <div className="border-l-4 border-rose-500 bg-rose-50 p-3 rounded text-sm text-rose-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <strong>{t.component.yorum.review_form.error_send_failed}</strong> {errorMsg ?? t.component.yorum.review_form.error_unknown}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={!formOk || status === "submitting"}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> {t.component.yorum.review_form.submitting}
            </>
          ) : (
            t.component.yorum.review_form.submit_button
          )}
        </button>
      </div>
    </form>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
