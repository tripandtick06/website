"use client";

import { useState, FormEvent } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useT, useLocale } from "@/lib/i18n/I18nProvider";
import { PhoneField, dialForLocale } from "@/components/booking/PhoneField";
import { EmailHint, useEmailHint } from "@/components/ui/EmailHint";
import { useFormFunnel } from "@/lib/analytics/useFormFunnel";
import { track } from "@/components/analytics/Tracker";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const t = useT();
  const { locale } = useLocale();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const emailHint = useEmailHint("contact");
  const funnel = useFormFunnel("contact");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("_hp")) {
      setStatus("error");
      setMessage(t.component.iletisim.contact_form.error_validation);
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      if (!res.ok) throw new Error(t.component.iletisim.contact_form.error_server);
      funnel.done();
      track("form_submit", { form: "contact", ok: true });
      setStatus("success");
      setMessage(t.component.iletisim.contact_form.success_message);
      form.reset();
      setEmail("");
    } catch {
      track("error", { form: "contact", field: "submit" });
      setStatus("error");
      setMessage(t.component.iletisim.contact_form.error_send);
    }
  }

  return (
    <form onSubmit={handleSubmit} onFocusCapture={funnel.onFocus} className="space-y-4">
      <input
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t.component.iletisim.contact_form.label_name}
          </label>
          <input id="name" name="name" type="text" required className="input-field" placeholder={t.component.iletisim.contact_form.placeholder_name} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t.component.iletisim.contact_form.label_email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              emailHint.clear();
            }}
            onBlur={() => emailHint.check(email)}
            className="input-field"
            placeholder="ornek@email.com"
          />
          <EmailHint hint={emailHint} onAccept={setEmail} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PhoneField
          id="phone"
          name="phone"
          label={t.component.iletisim.contact_form.label_phone}
          value={phone}
          onChange={setPhone}
          defaultDial={dialForLocale(locale)}
        />
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t.component.iletisim.contact_form.label_subject}
          </label>
          <select id="subject" name="subject" required className="input-field">
            <option value="">{t.component.iletisim.contact_form.subject_placeholder}</option>
            <option value="rezervasyon">{t.component.iletisim.contact_form.subject_reservation}</option>
            <option value="bilgi">{t.component.iletisim.contact_form.subject_info}</option>
            <option value="iptal">{t.component.iletisim.contact_form.subject_cancel}</option>
            <option value="kurumsal">{t.component.iletisim.contact_form.subject_corporate}</option>
            <option value="diger">{t.component.iletisim.contact_form.subject_other}</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1.5">
          {t.component.iletisim.contact_form.label_message}
        </label>
        <textarea id="message" name="message" required rows={5} className="input-field resize-none" placeholder={t.component.iletisim.contact_form.placeholder_message} />
      </div>

      <button type="submit" disabled={status === "loading"} className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-60">
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> {t.component.iletisim.contact_form.submitting}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> {t.component.iletisim.contact_form.submit_button}
          </>
        )}
      </button>

      {status === "success" && (
        <div className="bg-success/10 border border-success/30 rounded-xl p-4 flex gap-3 text-sm text-success">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p>{message}</p>
        </div>
      )}
      {status === "error" && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex gap-3 text-sm text-danger">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{message}</p>
        </div>
      )}

      <p className="text-xs text-slate-500">
        {t.component.iletisim.contact_form.kvkk_notice}
      </p>
    </form>
  );
}
