"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import {
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Tag,
  Download,
  Share2,
} from "lucide-react";
import {
  loadDraft,
  saveDraft,
  clearDraft,
  computeTotal,
  generateBookingCode,
  getPromoDiscount,
  isValidPromoCode,
  INSURANCE_PRICE_PER_PAX,
  type BookingDraft,
  type BookingPassenger,
  type BookingStep,
} from "@/lib/booking-storage";
import { formatPrice, formatDate, cn } from "@/lib/utils";

export interface BookingService {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  duration: string;
  adultPrice: number;
  childRatio: number;
  marketPrice?: number;
  currency: "EUR" | "TRY" | "USD";
  minAge: number;
  capacity: { min: number; max: number };
  includes: string[];
  warnings: string[];
  highlights: string[];
  image: string | null;
}

const NATIONALITIES = [
  { code: "TR", label: "Türkiye" },
  { code: "EN", label: "United Kingdom" },
  { code: "US", label: "United States" },
  { code: "DE", label: "Deutschland" },
  { code: "FR", label: "France" },
  { code: "ES", label: "España" },
  { code: "NL", label: "Nederland" },
  { code: "ZH", label: "中国" },
  { code: "HI", label: "भारत" },
  { code: "OTHER", label: "Diğer" },
];

const STEP_LABELS = [
  { id: 1, label: "Paket", icon: Tag },
  { id: 2, label: "Tarih", icon: Calendar },
  { id: 3, label: "Yolcular", icon: Users },
  { id: 4, label: "Özet", icon: ShieldCheck },
  { id: 5, label: "Ödeme", icon: CreditCard },
  { id: 6, label: "Onay", icon: CheckCircle2 },
] as const;

const passengerSchema = z.object({
  fullName: z.string().min(2, "Ad-soyad zorunlu"),
  email: z.string().email("Geçerli e-posta girin"),
  phone: z.string().min(7, "Telefon zorunlu"),
  nationality: z.string().min(2),
  age: z.number().int().min(0).max(120).optional(),
  accommodation: z.string().optional(),
});

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function makeEmptyPassenger(): BookingPassenger {
  return {
    fullName: "",
    email: "",
    phone: "",
    nationality: "TR",
    age: undefined,
    accommodation: "",
  };
}

export function BookingClient({ service }: { service: BookingService }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sessionId = searchParams?.get("session_id");
  const isDemo = searchParams?.get("demo") === "1";
  const isOnConfirmationStep = !!sessionId || isDemo;

  const [step, setStep] = useState<BookingStep>(isOnConfirmationStep ? 6 : 1);
  const [date, setDate] = useState<string>("");
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [insurance, setInsurance] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string>("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [policyAccepted, setPolicyAccepted] = useState<boolean>(false);
  const [passengers, setPassengers] = useState<BookingPassenger[]>([
    makeEmptyPassenger(),
    makeEmptyPassenger(),
  ]);
  const [passengerErrors, setPassengerErrors] = useState<Record<number, Record<string, string>>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingCode, setBookingCode] = useState<string>("");

  useEffect(() => {
    if (isOnConfirmationStep) {
      setBookingCode(generateBookingCode());
      return;
    }
    const draft = loadDraft();
    if (draft && draft.serviceSlug === service.slug) {
      setStep(draft.step);
      setDate(draft.date);
      setAdults(draft.adults);
      setChildren(draft.children);
      setInsurance(draft.insurance);
      setPromoCode(draft.promoCode ?? "");
      setPassengers(draft.passengers.length > 0 ? draft.passengers : [makeEmptyPassenger()]);
    }
  }, [service.slug, isOnConfirmationStep]);

  useEffect(() => {
    const want = adults + children;
    setPassengers((prev) => {
      if (prev.length === want) return prev;
      if (prev.length < want) {
        const next = [...prev];
        while (next.length < want) next.push(makeEmptyPassenger());
        return next;
      }
      return prev.slice(0, want);
    });
  }, [adults, children]);

  const totalPrice = useMemo(
    () =>
      computeTotal({
        adults,
        children,
        unitPrice: service.adultPrice,
        childRatio: service.childRatio,
        insurance,
        promoCode,
      }),
    [adults, children, service.adultPrice, service.childRatio, insurance, promoCode]
  );

  useEffect(() => {
    if (isOnConfirmationStep) return;
    const draft: BookingDraft = {
      serviceSlug: service.slug,
      serviceName: service.name,
      date,
      adults,
      children,
      unitPrice: service.adultPrice,
      childRatio: service.childRatio,
      currency: service.currency,
      passengers,
      insurance,
      promoCode: promoCode || undefined,
      totalPrice,
      step,
    };
    saveDraft(draft);
  }, [
    isOnConfirmationStep,
    service.slug,
    service.name,
    service.adultPrice,
    service.childRatio,
    service.currency,
    date,
    adults,
    children,
    passengers,
    insurance,
    promoCode,
    totalPrice,
    step,
  ]);

  function goNext() {
    if (step < 6) setStep((s) => (s + 1) as BookingStep);
  }
  function goBack() {
    if (step > 1) setStep((s) => (s - 1) as BookingStep);
  }

  function validatePassengers(): boolean {
    const errs: Record<number, Record<string, string>> = {};
    let ok = true;
    passengers.forEach((p, i) => {
      const res = passengerSchema.safeParse(p);
      if (!res.success) {
        ok = false;
        const fieldErrs: Record<string, string> = {};
        res.error.errors.forEach((e) => {
          if (e.path[0]) fieldErrs[String(e.path[0])] = e.message;
        });
        errs[i] = fieldErrs;
      }
    });
    setPassengerErrors(errs);
    return ok;
  }

  function applyPromo() {
    if (!promoCode.trim()) {
      setPromoStatus("idle");
      return;
    }
    setPromoStatus(isValidPromoCode(promoCode) ? "valid" : "invalid");
  }

  async function startCheckout() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const leadPax = passengers[0];
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: service.slug,
          serviceName: service.name,
          date,
          adults,
          children,
          totalPrice,
          currency: service.currency,
          customerEmail: leadPax?.email ?? "",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? `Ödeme başlatılamadı (${res.status})`);
      }
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("Ödeme URL'i alınamadı");
      window.location.href = data.url;
    } catch (err) {
      console.error("[booking] checkout failed", err);
      setSubmitError(err instanceof Error ? err.message : "Bilinmeyen hata");
      setSubmitting(false);
    }
  }

  function updatePassenger(idx: number, field: keyof BookingPassenger, value: string | number) {
    setPassengers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  }

  const canStep2Continue = !!date && date >= tomorrowIso();
  const canStep4Continue = policyAccepted;

  const discount = getPromoDiscount(promoCode);
  const paxCount = adults + children;
  const insuranceTotal = insurance ? paxCount * INSURANCE_PRICE_PER_PAX : 0;
  const adultsLine = adults * service.adultPrice;
  const childrenLine = Math.round(children * service.adultPrice * service.childRatio);
  const subtotalBeforeDiscount = adultsLine + childrenLine + insuranceTotal;
  const discountAmount = subtotalBeforeDiscount - totalPrice;

  function handleStartOver() {
    clearDraft();
    setStep(1);
    setDate("");
    setAdults(2);
    setChildren(0);
    setInsurance(false);
    setPromoCode("");
    setPolicyAccepted(false);
    setPassengers([makeEmptyPassenger(), makeEmptyPassenger()]);
    router.replace(`/rezervasyon/${service.slug}`);
  }

  const categoryHref =
    service.category === "balloon" ? "/balonlar" :
    service.category === "tour" ? "/turlar" :
    service.category === "hotel" ? "/oteller" :
    service.category === "package" ? "/paketler" :
    service.category === "transfer" ? "/aktiviteler" :
    "/aktiviteler";

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <nav className="text-sm text-slate-500 mb-4">
          <Link href="/" className="hover:underline">Ana Sayfa</Link>
          <span className="mx-2">›</span>
          <Link href={categoryHref} className="hover:underline">
            {service.category === "balloon" ? "Balon Turları" : "Hizmetler"}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-slate-700">Rezervasyon</span>
        </nav>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Online Rezervasyon</h1>
        <p className="text-slate-600 mb-8">{service.name} — {service.shortDescription}</p>

        <ProgressBar currentStep={step} />

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 lg:p-8">
            {step === 1 && <Step1Overview service={service} onNext={goNext} />}
            {step === 2 && (
              <Step2DateAndPax
                service={service}
                date={date}
                setDate={setDate}
                adults={adults}
                setAdults={setAdults}
                children={children}
                setChildren={setChildren}
                canContinue={canStep2Continue}
                onBack={goBack}
                onNext={goNext}
              />
            )}
            {step === 3 && (
              <Step3Passengers
                service={service}
                adults={adults}
                children={children}
                passengers={passengers}
                errors={passengerErrors}
                onUpdate={updatePassenger}
                onBack={goBack}
                onNext={() => {
                  if (validatePassengers()) goNext();
                }}
              />
            )}
            {step === 4 && (
              <Step4Summary
                service={service}
                date={date}
                adults={adults}
                children={children}
                insurance={insurance}
                setInsurance={setInsurance}
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                applyPromo={applyPromo}
                promoStatus={promoStatus}
                policyAccepted={policyAccepted}
                setPolicyAccepted={setPolicyAccepted}
                totalPrice={totalPrice}
                adultsLine={adultsLine}
                childrenLine={childrenLine}
                insuranceTotal={insuranceTotal}
                discountAmount={discountAmount}
                discount={discount}
                canContinue={canStep4Continue}
                onBack={goBack}
                onNext={goNext}
              />
            )}
            {step === 5 && (
              <Step5Payment
                service={service}
                totalPrice={totalPrice}
                submitting={submitting}
                error={submitError}
                onBack={goBack}
                onPay={startCheckout}
              />
            )}
            {step === 6 && (
              <Step6Confirmation
                service={service}
                bookingCode={bookingCode || "TT-DEMO-1234"}
                date={date}
                paxCount={paxCount}
                totalPrice={totalPrice}
                onStartOver={handleStartOver}
              />
            )}
          </div>

          <aside className="bg-white rounded-2xl shadow-sm p-6 h-fit lg:sticky lg:top-4">
            <h3 className="font-bold text-slate-900 mb-4">Rezervasyon Özeti</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Hizmet</span>
                <span className="font-medium text-right">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Süre</span>
                <span>{service.duration}</span>
              </div>
              {date && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Tarih</span>
                  <span>{formatDate(date)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">Yetişkin</span>
                <span>{adults} × {formatPrice(service.adultPrice, service.currency)}</span>
              </div>
              {children > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Çocuk</span>
                  <span>{children} × {formatPrice(Math.round(service.adultPrice * service.childRatio), service.currency)}</span>
                </div>
              )}
              {insurance && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Sigorta</span>
                  <span>{formatPrice(insuranceTotal, service.currency)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>İndirim</span>
                  <span>−{formatPrice(discountAmount, service.currency)}</span>
                </div>
              )}
              <hr className="my-3" />
              <div className="flex justify-between items-baseline text-lg">
                <span className="font-bold">Toplam</span>
                <span className="font-bold text-amber-600">{formatPrice(totalPrice, service.currency)}</span>
              </div>
              {service.marketPrice && (
                <p className="text-xs text-emerald-700">
                  Piyasa fiyatından {formatPrice((service.marketPrice - service.adultPrice) * adults, service.currency)} avantajlı.
                </p>
              )}
            </div>
            <div className="mt-6 space-y-2 text-xs text-slate-500">
              <p>✓ Hava iptalinde %100 iade</p>
              <p>✓ 48 saat öncesine kadar ücretsiz iptal</p>
              <p>✓ SSL korumalı ödeme (Stripe)</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ProgressBar({ currentStep }: { currentStep: BookingStep }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 overflow-x-auto">
      <ol className="flex items-center justify-between gap-2 min-w-[600px]">
        {STEP_LABELS.map((s, i) => {
          const Icon = s.icon;
          const done = currentStep > s.id;
          const active = currentStep === s.id;
          return (
            <li key={s.id} className="flex items-center flex-1">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                  done && "bg-emerald-50 text-emerald-700",
                  active && "bg-amber-50 text-amber-700 font-semibold",
                  !done && !active && "text-slate-400"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    done && "bg-emerald-500 text-white",
                    active && "bg-amber-500 text-white",
                    !done && !active && "bg-slate-200 text-slate-500"
                  )}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="hidden sm:inline text-sm">{s.label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={cn("flex-1 h-px mx-1", done ? "bg-emerald-300" : "bg-slate-200")} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Step1Overview({ service, onNext }: { service: BookingService; onNext: () => void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Paket Özeti</h2>
      <div className="space-y-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-2">{service.name}</h3>
          <p className="text-slate-600 text-sm mb-3">{service.shortDescription}</p>
          <div className="flex flex-wrap gap-2">
            {service.highlights.map((h) => (
              <span key={h} className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs">
                {h}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 mb-2">Dahil Olanlar</h4>
          <ul className="space-y-1 text-sm text-slate-600">
            {service.includes.map((inc) => (
              <li key={inc} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                {inc}
              </li>
            ))}
          </ul>
        </div>
        {service.warnings.length > 0 && (
          <div className="border-l-4 border-amber-500 bg-amber-50 p-3 rounded">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 mb-1">Önemli Uyarılar</p>
                <ul className="space-y-1 text-amber-800">
                  {service.warnings.map((w) => (
                    <li key={w}>• {w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Devam Et <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Step2DateAndPax(props: {
  service: BookingService;
  date: string;
  setDate: (v: string) => void;
  adults: number;
  setAdults: (v: number) => void;
  children: number;
  setChildren: (v: number) => void;
  canContinue: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const { service, date, setDate, adults, setAdults, children, setChildren, canContinue, onBack, onNext } = props;
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Tarih ve Kişi Sayısı</h2>
      <div className="space-y-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Uçuş Tarihi</label>
          <input
            type="date"
            min={tomorrowIso()}
            value={date}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <p className="text-xs text-slate-500 mt-1">En erken yarın için rezervasyon yapabilirsiniz.</p>
        </div>
        <Counter label="Yetişkin (12+ yaş)" value={adults} min={1} max={20} onChange={setAdults} />
        <Counter label={`Çocuk (${service.minAge || 6}-11 yaş)`} value={children} min={0} max={10} onChange={setChildren} disabled={service.minAge >= 16} />
        {service.minAge >= 6 && (
          <div className="border-l-4 border-amber-500 bg-amber-50 p-3 rounded text-sm text-amber-900">
            <strong>Yaş kısıtı:</strong> {service.minAge} yaş altı çocuklar bu hizmete katılamaz.
            Hamileler ve ciddi sağlık sorunu olanlar binemez. Detaylı koşullar için <Link href="/sss" className="underline">SSS</Link> sayfasına bakın.
          </div>
        )}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} disabled={!canContinue} />
    </div>
  );
}

function Counter({ label, value, min, max, onChange, disabled }: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={disabled || value <= min}
          className="w-9 h-9 rounded-full border border-slate-300 hover:bg-slate-50 disabled:opacity-30"
        >−</button>
        <span className="w-8 text-center font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={disabled || value >= max}
          className="w-9 h-9 rounded-full border border-slate-300 hover:bg-slate-50 disabled:opacity-30"
        >+</button>
      </div>
    </div>
  );
}

function Step3Passengers(props: {
  service: BookingService;
  adults: number;
  children: number;
  passengers: BookingPassenger[];
  errors: Record<number, Record<string, string>>;
  onUpdate: (idx: number, field: keyof BookingPassenger, value: string | number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { passengers, errors, onUpdate, onBack, onNext, adults } = props;
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">3. Yolcu Bilgileri</h2>
      <p className="text-sm text-slate-500 mb-6">İletişim bilgileri grup lideri için zorunlu. Konaklama transferi için otel adı önemli.</p>
      <div className="space-y-6">
        {passengers.map((p, i) => {
          const isLead = i === 0;
          const isAdult = i < adults;
          const errs = errors[i] ?? {};
          return (
            <div key={i} className="border border-slate-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-3">
                {isLead ? "👤 Grup Lideri" : `${isAdult ? "Yetişkin" : "Çocuk"} ${isAdult ? i + 1 : i - adults + 1}`}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Ad Soyad" value={p.fullName} onChange={(v) => onUpdate(i, "fullName", v)} error={errs.fullName} />
                <Field label="Uyruk" value={p.nationality} onChange={(v) => onUpdate(i, "nationality", v)} as="select" options={NATIONALITIES} />
                <Field label="E-posta" type="email" value={p.email} onChange={(v) => onUpdate(i, "email", v)} error={errs.email} />
                <Field label="Telefon" type="tel" placeholder="+90 5xx ..." value={p.phone} onChange={(v) => onUpdate(i, "phone", v)} error={errs.phone} />
                <Field label="Yaş" type="number" value={p.age?.toString() ?? ""} onChange={(v) => onUpdate(i, "age", v ? Number(v) : 0)} />
                <Field label="Konaklama (otel adı + Kapadokya)" value={p.accommodation ?? ""} onChange={(v) => onUpdate(i, "accommodation", v)} placeholder="Örn: Sultan Cave Suites - Göreme" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <NavButtons onBack={onBack} onNext={onNext} />
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  placeholder?: string;
  as?: "input" | "select";
  options?: Array<{ code: string; label: string }>;
}) {
  const { label, value, onChange, type = "text", error, placeholder, as = "input", options = [] } = props;
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-700 mb-1">{label}</span>
      {as === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {options.map((o) => (
            <option key={o.code} value={o.code}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500",
            error ? "border-rose-400" : "border-slate-300"
          )}
        />
      )}
      {error && <span className="text-xs text-rose-600 mt-1 block">{error}</span>}
    </label>
  );
}

function Step4Summary(props: {
  service: BookingService;
  date: string;
  adults: number;
  children: number;
  insurance: boolean;
  setInsurance: (v: boolean) => void;
  promoCode: string;
  setPromoCode: (v: string) => void;
  applyPromo: () => void;
  promoStatus: "idle" | "valid" | "invalid";
  policyAccepted: boolean;
  setPolicyAccepted: (v: boolean) => void;
  totalPrice: number;
  adultsLine: number;
  childrenLine: number;
  insuranceTotal: number;
  discountAmount: number;
  discount: number;
  canContinue: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const {
    service, date, adults, children, insurance, setInsurance,
    promoCode, setPromoCode, applyPromo, promoStatus,
    policyAccepted, setPolicyAccepted,
    totalPrice, adultsLine, childrenLine, insuranceTotal, discountAmount,
    canContinue, onBack, onNext,
  } = props;

  const paxCount = adults + children;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Özet ve Ekstralar</h2>
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-600">Hizmet</span><span className="font-medium">{service.name}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">Tarih</span><span>{date ? formatDate(date) : "—"}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">Kişi sayısı</span><span>{paxCount} ({adults} yetişkin, {children} çocuk)</span></div>
        </div>

        <div className="border border-slate-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={insurance} onChange={(e) => setInsurance(e.target.checked)} className="mt-1 w-4 h-4" />
            <div>
              <p className="font-semibold text-slate-900">Seyahat Sigortası (+€{INSURANCE_PRICE_PER_PAX} kişi başı)</p>
              <p className="text-sm text-slate-600 mt-1">İptal koruması, medikal kapsam, bagaj kaybı. {paxCount} kişi için toplam €{paxCount * INSURANCE_PRICE_PER_PAX}.</p>
            </div>
          </label>
        </div>

        <div className="border border-slate-200 rounded-lg p-4">
          <p className="font-semibold text-slate-900 mb-2">Promosyon Kodu</p>
          <div className="flex gap-2">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="WELCOME10"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase"
            />
            <button onClick={applyPromo} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800">Uygula</button>
          </div>
          {promoStatus === "valid" && <p className="text-xs text-emerald-600 mt-2">✓ Kod geçerli — indirim uygulandı.</p>}
          {promoStatus === "invalid" && <p className="text-xs text-rose-600 mt-2">Kod geçersiz.</p>}
        </div>

        <div className="border-2 border-amber-200 bg-amber-50 rounded-lg p-4">
          <h3 className="font-bold text-slate-900 mb-3">Fiyat Dökümü</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Yetişkin × {adults}</span><span>{formatPrice(adultsLine, service.currency)}</span></div>
            {children > 0 && <div className="flex justify-between"><span>Çocuk × {children}</span><span>{formatPrice(childrenLine, service.currency)}</span></div>}
            {insurance && <div className="flex justify-between"><span>Sigorta × {paxCount}</span><span>{formatPrice(insuranceTotal, service.currency)}</span></div>}
            {discountAmount > 0 && <div className="flex justify-between text-emerald-700"><span>İndirim</span><span>−{formatPrice(discountAmount, service.currency)}</span></div>}
            <hr className="my-2 border-amber-300" />
            <div className="flex justify-between text-lg font-bold"><span>Toplam</span><span className="text-amber-600">{formatPrice(totalPrice, service.currency)}</span></div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
          <h4 className="font-semibold text-slate-900 mb-2">İptal Politikası</h4>
          <ul className="space-y-1 text-xs">
            <li>• Hava durumu nedeniyle operatör iptalinde <strong>%100 iade</strong>.</li>
            <li>• 48 saat öncesine kadar ücretsiz iptal.</li>
            <li>• 24-48 saat içinde iptalde <strong>%50</strong> iade.</li>
            <li>• 24 saatten az iptalde iade yapılmaz.</li>
          </ul>
          <label className="flex items-start gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={policyAccepted} onChange={(e) => setPolicyAccepted(e.target.checked)} className="mt-1 w-4 h-4" />
            <span className="text-xs">
              <Link href="/yasal/kvkk" className="underline">KVKK</Link>, <Link href="/yasal/kullanim-kosullari" className="underline">Kullanım Koşulları</Link> ve iptal politikasını okudum, kabul ediyorum.
            </span>
          </label>
        </div>
      </div>
      <div className="mt-6">
        <NavButtons onBack={onBack} onNext={onNext} disabled={!canContinue} />
      </div>
    </div>
  );
}

function Step5Payment(props: {
  service: BookingService;
  totalPrice: number;
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onPay: () => void;
}) {
  const { service, totalPrice, submitting, error, onBack, onPay } = props;
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Güvenli Ödeme</h2>
      <div className="space-y-4">
        <div className="border border-slate-200 rounded-lg p-6 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-slate-700 mb-1">Ödeme <strong>Stripe</strong> ile SSL 256-bit şifreli yapılır.</p>
          <p className="text-sm text-slate-500">Kart bilgileri Trip and Tick'e iletilmez.</p>
        </div>

        {error && (
          <div className="border-l-4 border-rose-500 bg-rose-50 p-3 text-sm text-rose-800 rounded">
            <strong>Hata:</strong> {error}
          </div>
        )}

        <button
          onClick={onPay}
          disabled={submitting}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {submitting ? "Yönlendiriliyor..." : (
            <>
              <CreditCard className="w-5 h-5" />
              Güvenli Öde {formatPrice(totalPrice, service.currency)}
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2">
          <span>VISA</span><span>•</span><span>Mastercard</span><span>•</span><span>AmEx</span><span>•</span><span>Apple Pay</span>
        </div>
      </div>
      <div className="mt-6">
        <NavButtons onBack={onBack} onNext={() => {}} hideNext />
      </div>
    </div>
  );
}

function Step6Confirmation(props: {
  service: BookingService;
  bookingCode: string;
  date: string;
  paxCount: number;
  totalPrice: number;
  onStartOver: () => void;
}) {
  const { service, bookingCode, date, paxCount, totalPrice, onStartOver } = props;
  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Rezervasyonunuz Onaylandı!</h2>
      <p className="text-slate-600 mb-6">Detaylar e-postanıza gönderildi.</p>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 max-w-md mx-auto mb-6">
        <p className="text-sm text-slate-600 mb-1">Rezervasyon Kodu</p>
        <p className="text-3xl font-bold text-amber-700 tracking-wider">{bookingCode}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-2 max-w-md mx-auto text-sm text-left mb-6">
        <div className="bg-slate-50 rounded p-3">
          <p className="text-xs text-slate-500">Hizmet</p>
          <p className="font-semibold">{service.name}</p>
        </div>
        <div className="bg-slate-50 rounded p-3">
          <p className="text-xs text-slate-500">Tarih</p>
          <p className="font-semibold">{date ? formatDate(date) : "—"}</p>
        </div>
        <div className="bg-slate-50 rounded p-3">
          <p className="text-xs text-slate-500">Kişi</p>
          <p className="font-semibold">{paxCount}</p>
        </div>
        <div className="bg-slate-50 rounded p-3">
          <p className="text-xs text-slate-500">Toplam</p>
          <p className="font-semibold">{formatPrice(totalPrice, service.currency)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <a
          href={`/api/ical?bookingId=${bookingCode}&serviceName=${encodeURIComponent(service.name)}&date=${date}&time=05:00`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800"
        >
          <Calendar className="w-4 h-4" /> Takvime Ekle (.ics)
        </a>
        <a
          href={`/api/ticket-pdf?bookingId=${bookingCode}`}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50"
        >
          <Download className="w-4 h-4" /> Bilet PDF
        </a>
        <button
          onClick={async () => {
            const url = `${window.location.origin}/rezervasyon/${service.slug}`;
            if (typeof navigator !== "undefined" && navigator.share) {
              try { await navigator.share({ title: service.name, url }); } catch { /* user cancelled */ }
            } else if (typeof navigator !== "undefined") {
              await navigator.clipboard.writeText(url);
              alert("Link kopyalandı!");
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50"
        >
          <Share2 className="w-4 h-4" /> Paylaş
        </button>
      </div>

      <button onClick={onStartOver} className="text-sm text-amber-600 hover:underline">
        Yeni bir rezervasyon yap →
      </button>
    </div>
  );
}

function NavButtons({ onBack, onNext, disabled, hideNext }: {
  onBack: () => void;
  onNext: () => void;
  disabled?: boolean;
  hideNext?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 pt-4 border-t border-slate-100">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
      >
        <ChevronLeft className="w-4 h-4" /> Geri
      </button>
      {!hideNext && (
        <button
          onClick={onNext}
          disabled={disabled}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Devam Et <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
