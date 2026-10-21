"use client";

// E-posta tikfoutu ipucu (alan altında "Did you mean x@gmail.com?"). Engellemez, değeri kendi değiştirmez.
// Kullanım: const hint = useEmailHint("contact"); alanda onBlur={() => hint.check(value)},
// onChange'te hint.clear(); <EmailHint hint={hint} onAccept={setEmail} /> alanın altında.
// Koşullu render ({suggestion && …}) — hidden + inline display tuzağı yok.
// Olaylar (props'ta adres YOK, yalnız domain): click/kind=track/label=email_suggestie_getoond|overgenomen.

import { useCallback, useState } from "react";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { emailHintText, emailSuggestion } from "@/lib/emailSuggest";
import { track } from "@/components/analytics/Tracker";

export function useEmailHint(form: string) {
  const [suggestion, setSuggestion] = useState("");
  const check = useCallback(
    (value: string) => {
      const s = emailSuggestion(value);
      setSuggestion(s);
      if (s) track("click", { kind: "track", label: "email_suggestie_getoond", form, domain: s.split("@")[1] });
    },
    [form],
  );
  const clear = useCallback(() => setSuggestion(""), []);
  return { suggestion, check, clear, form };
}

export type EmailHintState = ReturnType<typeof useEmailHint>;

export function EmailHint({ hint, onAccept }: { hint: EmailHintState; onAccept: (value: string) => void }) {
  const { locale } = useLocale();
  const { suggestion } = hint;
  if (!suggestion) return null;
  const [pre, post] = emailHintText(locale);
  return (
    <p className="mt-1 text-xs text-slate-600" aria-live="polite">
      {pre}
      <button
        type="button"
        className="font-semibold underline"
        onClick={() => {
          onAccept(suggestion);
          track("click", { kind: "track", label: "email_suggestie_overgenomen", form: hint.form, domain: suggestion.split("@")[1] });
          hint.clear();
        }}
      >
        {suggestion}
      </button>
      {post}
    </p>
  );
}
