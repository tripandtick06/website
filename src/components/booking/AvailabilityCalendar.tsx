// AvailabilityCalendar — 2 ay grid renkli takvim, doluluk durumlu.
//
// Importers:
//   - src/app/rezervasyon/[slug]/BookingClient.tsx (Step 2 — input[type=date] yerine)
// Affected: rezervasyon Step 2 UX gorsellestirme. Onceden tek input vardı.
// Data: GET /api/availability?slug={slug}&from={YYYY-MM-DD}&to={YYYY-MM-DD}
//       response = { ok: true, days: [{date,status,remainingSlots,note?}] }
//       status enum: "available" | "limited" | "full"
// User verbatim: "devam et"

"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvailabilityStatus } from "@/data/availability";

interface DayData {
  date: string; // YYYY-MM-DD
  status: AvailabilityStatus;
  remainingSlots: number;
  note?: string;
}

export interface AvailabilityCalendarProps {
  serviceSlug: string;
  selectedDate: string; // YYYY-MM-DD (bos olabilir)
  onSelect: (date: string) => void;
  minDate?: string; // default = yarin
  maxDate?: string; // default = +120 gun
  className?: string;
}

const MONTH_NAMES = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const WEEKDAY_HEADERS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function isoFromYMD(y: number, m: number, d: number): string {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function plusDaysIso(base: string, days: number): string {
  const d = new Date(`${base}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Pazartesi=0, Pazar=6 (TR/EU normu)
function mondayBasedDow(date: Date): number {
  const d = date.getDay();
  return (d + 6) % 7;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface MonthGridCell {
  date: string | null;
  inMonth: boolean;
}

function buildMonthGrid(year: number, month: number): MonthGridCell[] {
  const cells: MonthGridCell[] = [];
  const first = new Date(year, month, 1);
  const leading = mondayBasedDow(first);
  for (let i = 0; i < leading; i++) cells.push({ date: null, inMonth: false });
  const days = daysInMonth(year, month);
  for (let d = 1; d <= days; d++) {
    cells.push({ date: isoFromYMD(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, inMonth: false });
  return cells;
}

export function AvailabilityCalendar({
  serviceSlug,
  selectedDate,
  onSelect,
  minDate,
  maxDate,
  className,
}: AvailabilityCalendarProps) {
  const effectiveMin = minDate || tomorrowIso();
  const effectiveMax = maxDate || plusDaysIso(todayIso(), 120);
  const today = todayIso();

  const initialAnchor = useMemo(() => {
    const ref = selectedDate || today;
    const d = new Date(`${ref}T00:00:00Z`);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
  }, [selectedDate, today]);

  const [anchorYear, setAnchorYear] = useState<number>(initialAnchor.year);
  const [anchorMonth, setAnchorMonth] = useState<number>(initialAnchor.month);
  const [data, setData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const secondYear = anchorMonth === 11 ? anchorYear + 1 : anchorYear;
  const secondMonth = (anchorMonth + 1) % 12;

  useEffect(() => {
    const from = isoFromYMD(anchorYear, anchorMonth, 1);
    const lastDay = daysInMonth(secondYear, secondMonth);
    const to = isoFromYMD(secondYear, secondMonth, lastDay);
    const controller = new AbortController();
    setLoading(true);
    fetch(
      `/api/availability?slug=${encodeURIComponent(serviceSlug)}&from=${from}&to=${to}`,
      { signal: controller.signal }
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json?.days) {
          setData({});
          return;
        }
        const map: Record<string, DayData> = {};
        for (const d of json.days as DayData[]) {
          map[d.date] = d;
        }
        setData(map);
      })
      .catch(() => { /* abort/network — sessiz */ })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [serviceSlug, anchorYear, anchorMonth, secondYear, secondMonth]);

  function goPrev() {
    const minD = new Date(`${effectiveMin}T00:00:00Z`);
    const minY = minD.getUTCFullYear();
    const minM = minD.getUTCMonth();
    if (anchorYear < minY || (anchorYear === minY && anchorMonth <= minM)) return;
    if (anchorMonth === 0) {
      setAnchorYear(anchorYear - 1);
      setAnchorMonth(11);
    } else {
      setAnchorMonth(anchorMonth - 1);
    }
  }

  function goNext() {
    const maxD = new Date(`${effectiveMax}T00:00:00Z`);
    const maxY = maxD.getUTCFullYear();
    const maxM = maxD.getUTCMonth();
    if (
      secondYear > maxY ||
      (secondYear === maxY && secondMonth >= maxM)
    ) return;
    if (anchorMonth === 11) {
      setAnchorYear(anchorYear + 1);
      setAnchorMonth(0);
    } else {
      setAnchorMonth(anchorMonth + 1);
    }
  }

  return (
    <div className={cn("border border-slate-200 rounded-xl bg-white", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <button
          type="button"
          onClick={goPrev}
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-30"
          aria-label="Önceki ay"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
          <span>Müsait Tarihler</span>
        </div>
        <button
          type="button"
          onClick={goNext}
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 disabled:opacity-30"
          aria-label="Sonraki ay"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        <MonthGrid
          year={anchorYear}
          month={anchorMonth}
          data={data}
          loading={loading}
          selectedDate={selectedDate}
          minDate={effectiveMin}
          maxDate={effectiveMax}
          onSelect={onSelect}
        />
        <MonthGrid
          year={secondYear}
          month={secondMonth}
          data={data}
          loading={loading}
          selectedDate={selectedDate}
          minDate={effectiveMin}
          maxDate={effectiveMax}
          onSelect={onSelect}
        />
      </div>

      <div className="px-4 pb-4 flex flex-wrap items-center gap-3 text-xs">
        <LegendDot className="bg-emerald-100 border-emerald-300" label="Müsait" />
        <LegendDot className="bg-amber-100 border-amber-300" label="Sınırlı" />
        <LegendDot className="bg-rose-100 border-rose-300" label="Dolu" />
        <LegendDot className="bg-slate-100 border-slate-200" label="Geçmiş / Kapalı" />
      </div>
    </div>
  );
}

function MonthGrid({
  year,
  month,
  data,
  loading,
  selectedDate,
  minDate,
  maxDate,
  onSelect,
}: {
  year: number;
  month: number;
  data: Record<string, DayData>;
  loading: boolean;
  selectedDate: string;
  minDate: string;
  maxDate: string;
  onSelect: (date: string) => void;
}) {
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const hasData = Object.keys(data).length > 0;

  return (
    <div>
      <div className="text-sm font-bold text-slate-900 mb-3 text-center">
        {MONTH_NAMES[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_HEADERS.map((w) => (
          <div
            key={w}
            className="text-[10px] uppercase font-semibold text-slate-400 text-center py-1"
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => (
          <CalendarCell
            key={i}
            iso={c.date}
            inMonth={c.inMonth}
            day={c.date ? data[c.date] ?? null : null}
            skeleton={loading && !hasData}
            selected={!!c.date && c.date === selectedDate}
            minDate={minDate}
            maxDate={maxDate}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function CalendarCell({
  iso,
  inMonth,
  day,
  skeleton,
  selected,
  minDate,
  maxDate,
  onSelect,
}: {
  iso: string | null;
  inMonth: boolean;
  day: DayData | null;
  skeleton: boolean;
  selected: boolean;
  minDate: string;
  maxDate: string;
  onSelect: (date: string) => void;
}) {
  if (!iso || !inMonth) {
    return <div className="aspect-square" aria-hidden />;
  }

  const dayNum = Number(iso.slice(8, 10));
  const outOfRange = iso < minDate || iso > maxDate;
  const isPast = iso < minDate;

  if (skeleton && !outOfRange) {
    return (
      <div className="aspect-square rounded-lg bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-300">
        {dayNum}
      </div>
    );
  }

  const status: AvailabilityStatus | "closed" = outOfRange
    ? "closed"
    : day?.status ?? "available";
  const remaining = day?.remainingSlots;

  let cls = "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed";
  let titleAttr = "";

  if (!outOfRange) {
    if (status === "available") {
      cls = "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 cursor-pointer";
      titleAttr = remaining !== undefined ? `Kalan: ${remaining} koltuk` : "Müsait";
    } else if (status === "limited") {
      cls = "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 cursor-pointer";
      titleAttr = remaining !== undefined ? `Son ${remaining} koltuk` : "Sınırlı";
    } else if (status === "full") {
      cls = "bg-rose-50 text-rose-700 border-rose-200 cursor-not-allowed";
      titleAttr = "Dolu — başka tarih seçin";
    }
  } else {
    titleAttr = isPast ? "Geçmiş tarih" : "Rezervasyona kapalı";
  }

  const disabled = outOfRange || status === "full";

  return (
    <button
      type="button"
      onClick={() => {
        if (!disabled && iso) onSelect(iso);
      }}
      disabled={disabled}
      title={titleAttr}
      aria-label={`${iso} — ${titleAttr}`}
      className={cn(
        "aspect-square rounded-lg border text-sm font-semibold transition-colors flex flex-col items-center justify-center gap-0.5 relative",
        cls,
        selected && "ring-2 ring-amber-500 ring-offset-1 z-10"
      )}
    >
      <span>{dayNum}</span>
      {remaining !== undefined && !outOfRange && status !== "full" && (
        <span className="text-[9px] font-normal opacity-70 leading-none">
          {remaining}
        </span>
      )}
    </button>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-slate-600">
      <span
        className={cn("inline-block w-3 h-3 rounded border", className)}
        aria-hidden
      />
      {label}
    </span>
  );
}
