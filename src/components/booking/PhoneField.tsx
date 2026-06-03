"use client";

// Uluslararasi telefon alani — ulke bayragi + dial-code secici + numara.
// Tum formlarda/dillerde kullanilir. value = tam string "+90 5xx ...".
// Uncontrolled formlar (FormData) icin `name` ver -> gizli input yazilir.

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/dictionaries";

interface Country {
  code: string;
  dial: string;
  flag: string;
  name: string;
}

// Bayrak emoji + dial code. Turist-kaynak + site dilleri kapsanir.
const COUNTRIES: Country[] = [
  { code: "TR", dial: "+90", flag: "🇹🇷", name: "Türkiye" },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "United States" },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "DE", dial: "+49", flag: "🇩🇪", name: "Deutschland" },
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France" },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "España" },
  { code: "IT", dial: "+39", flag: "🇮🇹", name: "Italia" },
  { code: "NL", dial: "+31", flag: "🇳🇱", name: "Nederland" },
  { code: "PT", dial: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brasil" },
  { code: "RU", dial: "+7", flag: "🇷🇺", name: "Россия" },
  { code: "UA", dial: "+380", flag: "🇺🇦", name: "Україна" },
  { code: "AZ", dial: "+994", flag: "🇦🇿", name: "Azərbaycan" },
  { code: "JP", dial: "+81", flag: "🇯🇵", name: "日本" },
  { code: "KR", dial: "+82", flag: "🇰🇷", name: "대한민국" },
  { code: "CN", dial: "+86", flag: "🇨🇳", name: "中国" },
  { code: "IN", dial: "+91", flag: "🇮🇳", name: "India" },
  { code: "PK", dial: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "MX", dial: "+52", flag: "🇲🇽", name: "México" },
  { code: "UY", dial: "+598", flag: "🇺🇾", name: "Uruguay" },
  { code: "AR", dial: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "CL", dial: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "CO", dial: "+57", flag: "🇨🇴", name: "Colombia" },
  { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "AU", dial: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "AT", dial: "+43", flag: "🇦🇹", name: "Österreich" },
  { code: "CH", dial: "+41", flag: "🇨🇭", name: "Schweiz" },
  { code: "BE", dial: "+32", flag: "🇧🇪", name: "België" },
  { code: "SE", dial: "+46", flag: "🇸🇪", name: "Sverige" },
  { code: "NO", dial: "+47", flag: "🇳🇴", name: "Norge" },
  { code: "DK", dial: "+45", flag: "🇩🇰", name: "Danmark" },
  { code: "FI", dial: "+358", flag: "🇫🇮", name: "Suomi" },
  { code: "PL", dial: "+48", flag: "🇵🇱", name: "Polska" },
  { code: "CZ", dial: "+420", flag: "🇨🇿", name: "Česko" },
  { code: "GR", dial: "+30", flag: "🇬🇷", name: "Ελλάδα" },
  { code: "RO", dial: "+40", flag: "🇷🇴", name: "România" },
  { code: "IE", dial: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "IL", dial: "+972", flag: "🇮🇱", name: "ישראל" },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "SA", dial: "+966", flag: "🇸🇦", name: "السعودية" },
  { code: "QA", dial: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "KW", dial: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "EG", dial: "+20", flag: "🇪🇬", name: "مصر" },
  { code: "MA", dial: "+212", flag: "🇲🇦", name: "Maroc" },
  { code: "ZA", dial: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "ID", dial: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "MY", dial: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "SG", dial: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "TH", dial: "+66", flag: "🇹🇭", name: "ไทย" },
  { code: "PH", dial: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "VN", dial: "+84", flag: "🇻🇳", name: "Việt Nam" },
];

// Site dili -> varsayilan ulke dial kodu.
const LOCALE_DIAL: Partial<Record<Locale, string>> = {
  tr: "+90", en: "+44", de: "+49", fr: "+33", es: "+34", nl: "+31",
  zh: "+86", hi: "+91", ur: "+92", pt: "+351", "pt-BR": "+55",
  ja: "+81", ko: "+82", it: "+39", ru: "+7", uk: "+380", az: "+994",
};

export function dialForLocale(locale: Locale): string {
  return LOCALE_DIAL[locale] ?? "+90";
}

interface PhoneFieldProps {
  label: string;
  value: string;
  onChange: (full: string) => void;
  defaultDial?: string;
  error?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

export function PhoneField({
  label,
  value,
  onChange,
  defaultDial = "+90",
  error,
  id,
  name,
  required,
}: PhoneFieldProps) {
  // value "+90 5xx" -> dial + kalan. En uzun dial onceligi.
  const parsed = useMemo(() => {
    const v = (value || "").trim();
    const dials = [...new Set(COUNTRIES.map((c) => c.dial))].sort((a, b) => b.length - a.length);
    const match = dials.find((d) => v.startsWith(d));
    if (match) return { dial: match, num: v.slice(match.length).trim() };
    return { dial: defaultDial, num: v };
  }, [value, defaultDial]);

  const [dial, setDial] = useState(parsed.dial);
  const [num, setNum] = useState(parsed.num);

  function emit(nextDial: string, nextNum: string) {
    const clean = nextNum.replace(/[^\d\s]/g, "");
    onChange(`${nextDial} ${clean}`.trim());
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          aria-label="Country code"
          value={dial}
          onChange={(e) => {
            setDial(e.target.value);
            emit(e.target.value, num);
          }}
          className="input-field !w-auto shrink-0 pr-7"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.dial}>
              {c.flag} {c.dial}
            </option>
          ))}
        </select>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          required={required}
          value={num}
          onChange={(e) => {
            setNum(e.target.value);
            emit(dial, e.target.value);
          }}
          placeholder="5XX XXX XX XX"
          className="input-field flex-1"
        />
      </div>
      {/* Uncontrolled formlar (FormData) icin tam deger */}
      {name && <input type="hidden" name={name} value={`${dial} ${num}`.trim()} />}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
