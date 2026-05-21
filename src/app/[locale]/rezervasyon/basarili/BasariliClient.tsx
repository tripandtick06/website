"use client";

// Basarili-page client component — 3 CTA (PDF, iCal, Hesabim) + booking-kod kalici localStorage.
// User verbatim: "en uzunundan basla, en son benim mudahelem gereken seyleri yap"
//
// Callers: src/app/rezervasyon/basarili/page.tsx.
// Glob check: BasariliClient previously empty.
// Data: localStorage "tripandtick:booking:draft" oku (mevcut) + "tripandtick:bookings" upsert (yeni).

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { useT } from "@/lib/i18n/I18nProvider";
import { tNodes } from "@/lib/i18n/trans";
import { AlertTriangle, CalendarPlus, CheckCircle2, FileText, Home, Mail, UserCircle } from "lucide-react";
import { loadDraft, generateBookingCode, clearDraft } from "@/lib/booking-storage";

interface Props {
  isDemo: boolean;
  sessionId?: string;
  slug?: string;
  total?: string;
  currency?: string;
  bookingIdFromUrl?: string;
}

const BOOKINGS_STORAGE_KEY = "tripandtick:bookings";

interface StoredBooking {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceName: string;
  serviceSlug: string;
  date: string;
  adults: number;
  children: number;
  totalPrice: number;
  currency: string;
  insurance?: boolean;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

function appendBooking(b: StoredBooking) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
    const list: StoredBooking[] = raw ? (JSON.parse(raw) as StoredBooking[]) : [];
    const filtered = Array.isArray(list) ? list.filter((x) => x.bookingId !== b.bookingId) : [];
    const next = [b, ...filtered].slice(0, 50);
    window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function BasariliClient(props: Props) {
  const t = useT();
  const ns = t.component.rezervasyon.success_client;
  const { isDemo, slug: slugUrl, total: totalUrl, currency: currencyUrl, bookingIdFromUrl } = props;
  const [booking, setBooking] = useState<StoredBooking | null>(null);

  useEffect(() => {
    const draft = loadDraft();
    const code = bookingIdFromUrl?.toUpperCase() ?? "TT-" + generateBookingCode();
    const leadPax = draft?.passengers?.[0];

    const next: StoredBooking = {
      bookingId: code,
      customerName: leadPax?.fullName ?? ns.default_customer_name,
      customerEmail: leadPax?.email ?? "",
      customerPhone: leadPax?.phone ?? "",
      serviceName: draft?.serviceName ?? ns.default_service_name,
      serviceSlug: draft?.serviceSlug ?? slugUrl ?? "kapadokya-balon-turu",
      date: draft?.date ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      adults: draft?.adults ?? 2,
      children: draft?.children ?? 0,
      totalPrice: draft?.totalPrice ?? Number(totalUrl ?? "350") ?? 350,
      currency: draft?.currency ?? (currencyUrl?.toUpperCase() ?? "EUR"),
      insurance: draft?.insurance ?? false,
      status: isDemo ? "pending" : "confirmed",
      createdAt: new Date().toISOString(),
    };

    setBooking(next);
    appendBooking(next);
    clearDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const code = booking?.bookingId ?? "TT-…";

  const receiptHref = useMemo(() => {
    if (!booking) return "#";
    const p = new URLSearchParams({
      serviceName: booking.serviceName,
      serviceSlug: booking.serviceSlug,
      date: booking.date,
      adults: String(booking.adults),
      children: String(booking.children),
      total: String(booking.totalPrice),
      currency: booking.currency,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone ?? "",
      insurance: booking.insurance ? "1" : "0",
      lang: "tr",
    });
    return `/api/receipt/${encodeURIComponent(booking.bookingId)}?${p.toString()}`;
  }, [booking]);

  const icalHref = useMemo(() => {
    if (!booking) return "#";
    const p = new URLSearchParams({
      bookingId: booking.bookingId,
      serviceName: booking.serviceName,
      date: booking.date,
      time: "05:00",
    });
    return `/api/ical?${p.toString()}`;
  }, [booking]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 flex items-center justify-center py-10 px-4 pt-[88px]">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 lg:p-12 text-center">
        {isDemo && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 mb-6 text-left flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900 text-sm">{ns.demo_badge}</p>
              <p className="text-xs text-rose-800 mt-1">
                {ns.demo_description}{" "}
                <a href="tel:+905374647861" className="font-semibold underline">+90 537 464 78 61</a>
                {" / "}
                <a href="https://wa.me/905374647861" className="font-semibold underline" target="_blank" rel="noreferrer">WhatsApp</a>.
              </p>
              <p className="text-[10px] text-rose-700 mt-2">
                {ns.demo_admin_note}
              </p>
            </div>
          </div>
        )}
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-14 h-14 text-emerald-600" />
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3">
          {isDemo ? ns.heading_demo : ns.heading_success}
        </h1>
        <p className="text-lg text-slate-600 mb-1">
          {isDemo ? ns.subheading_demo : ns.subheading_success}
        </p>
        <p className="text-sm text-slate-500 mb-8">
          {isDemo ? ns.note_demo : ns.note_success}
        </p>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-8">
          <p className="text-sm text-slate-600 mb-2">{ns.booking_code_label}</p>
          <p className="text-3xl lg:text-4xl font-bold text-amber-700 tracking-wider font-mono">{code}</p>
          <p className="text-xs text-slate-500 mt-3">{ns.booking_code_hint}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <a
            href={receiptHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors text-sm"
          >
            <FileText className="w-4 h-4" /> {ns.cta_pdf}
          </a>
          <a
            href={icalHref}
            className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-800 px-5 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors text-sm"
          >
            <CalendarPlus className="w-4 h-4" /> {ns.cta_ical}
          </a>
          <Link
            href={`/hesabim?code=${encodeURIComponent(code)}`}
            className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white px-5 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors text-sm"
          >
            <UserCircle className="w-4 h-4" /> {ns.cta_my_booking}
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 text-left mb-8">
          <InfoCard icon={Mail} title={ns.info_email_title} body={ns.info_email_body} />
          <InfoCard icon={CalendarPlus} title={ns.info_reminder_title} body={ns.info_reminder_body} />
          <InfoCard icon={CheckCircle2} title={ns.info_operator_title} body={ns.info_operator_body} />
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-lg font-medium text-slate-700">
            <Home className="w-4 h-4" /> {ns.nav_home}
          </Link>
          <Link href="/balonlar" className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-lg font-medium text-slate-700">
            {ns.nav_rebook}
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-8">
          {tNodes(ns.contact_line, {
            mail: <a href="mailto:hello@tripandtick.com" className="underline">hello@tripandtick.com</a>,
            wa: (
              <a href="https://wa.me/905374647861" className="underline" target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            ),
          })}
        </p>
      </div>
    </main>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <Icon className="w-5 h-5 text-amber-600 mb-2" />
      <p className="font-semibold text-slate-900 text-sm mb-1">{title}</p>
      <p className="text-xs text-slate-600">{body}</p>
    </div>
  );
}
