"use client";

// Interactive site search — reads/writes URL ?q= ?category= and persists recent queries.
// Advanced filters: price range chips, rating min, duration bucket, currency, sort.
//
// Importers:
//   - src/app/ara/page.tsx (server shell renders <SearchClient ... />)
// Affected: client-side substring search UI + recent-searches localStorage + URL state.
// Data:
//   - localStorage key "tripandtick:recent-searches" = JSON array of {q: string, ts: ISO 8601}.
//   - Max 8 entries, dedup by case-insensitive q.
//   - URL: ?q=&category=&priceMin=&priceMax=&rating=&duration=&currency=&sort=
// User verbatim: "Fiyat aralığı dual-slider veya 4 chip, Rating 3+/4+/4.5+ chip,
// Sure < 2 saat / 2-4 saat / Yarim gun / Tam gun / Cok gunlu chip,
// Para birimi filter, Sıralama dropdown."

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { useT } from "@/lib/i18n/I18nProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  Search as SearchIcon,
  X as XIcon,
  Star,
  Clock,
  Wind,
  MountainSnow,
  TreePine,
  Hotel,
  Package as PackageIcon,
  Car,
  BookOpen,
  SlidersHorizontal,
} from "lucide-react";
import {
  searchAll,
  getCategoryCounts,
  suggestFallback,
  type SearchCategory,
  type SearchResult,
  type DurationBucket,
  type SortKey,
  type SearchFilters,
} from "@/lib/search";
import { formatPrice, cn } from "@/lib/utils";

const RECENT_KEY = "tripandtick:recent-searches";
const RECENT_MAX = 8;

type CategoryFilter = SearchCategory | "all";
type CurrencyFilter = "any" | "EUR" | "TRY" | "USD";

interface PriceChip {
  id: string;
  label: string;
  min: number | null;
  max: number | null;
}

const PRICE_CHIP_DEFS: { id: string; min: number | null; max: number | null }[] = [
  { id: "any", min: null, max: null },
  { id: "0-50", min: 0, max: 50 },
  { id: "50-150", min: 50, max: 150 },
  { id: "150-300", min: 150, max: 300 },
  { id: "300+", min: 300, max: null },
];

const RATING_CHIP_DEFS: { id: string; value: number | null }[] = [
  { id: "any", value: null },
  { id: "3", value: 3 },
  { id: "4", value: 4 },
  { id: "4.5", value: 4.5 },
];

const DURATION_CHIP_DEFS: { id: DurationBucket }[] = [
  { id: "any" },
  { id: "lt2h" },
  { id: "2to4h" },
  { id: "halfDay" },
  { id: "fullDay" },
  { id: "multiDay" },
];

const CURRENCY_CHIP_DEFS: { id: CurrencyFilter }[] = [
  { id: "any" },
  { id: "EUR" },
  { id: "TRY" },
  { id: "USD" },
];

const SORT_OPTION_DEFS: { id: SortKey }[] = [
  { id: "popularity" },
  { id: "priceAsc" },
  { id: "priceDesc" },
  { id: "ratingDesc" },
  { id: "newest" },
];

const CATEGORY_TAB_DEFS: { id: CategoryFilter; icon: typeof Wind }[] = [
  { id: "all", icon: SearchIcon },
  { id: "balloon", icon: Wind },
  { id: "package", icon: PackageIcon },
  { id: "tour", icon: TreePine },
  { id: "activity", icon: MountainSnow },
  { id: "hotel", icon: Hotel },
  { id: "transfer", icon: Car },
  { id: "pillar", icon: BookOpen },
];

interface RecentEntry {
  q: string;
  ts: string;
}

function loadRecent(): RecentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is RecentEntry =>
        e && typeof e === "object" && typeof e.q === "string" && typeof e.ts === "string"
    );
  } catch {
    return [];
  }
}

function pushRecent(q: string): RecentEntry[] {
  if (typeof window === "undefined") return [];
  const trimmed = q.trim();
  if (!trimmed) return loadRecent();
  const existing = loadRecent().filter(
    (e) => e.q.toLowerCase() !== trimmed.toLowerCase()
  );
  const next: RecentEntry[] = [
    { q: trimmed, ts: new Date().toISOString() },
    ...existing,
  ].slice(0, RECENT_MAX);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* quota exceeded — ignore */
  }
  return next;
}

function clearRecent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}

function isCategoryFilter(value: string): value is CategoryFilter {
  return (
    value === "all" ||
    value === "balloon" ||
    value === "activity" ||
    value === "tour" ||
    value === "hotel" ||
    value === "package" ||
    value === "transfer" ||
    value === "pillar"
  );
}

function isDurationBucket(value: string): value is DurationBucket {
  return ["any", "lt2h", "2to4h", "halfDay", "fullDay", "multiDay"].includes(value);
}

function isSortKey(value: string): value is SortKey {
  return ["popularity", "priceAsc", "priceDesc", "ratingDesc", "newest"].includes(value);
}

function isCurrency(value: string): value is CurrencyFilter {
  return value === "any" || value === "EUR" || value === "TRY" || value === "USD";
}

const CATEGORY_GRADIENT: Record<SearchCategory, string> = {
  balloon: "from-accent to-accent-light",
  activity: "from-success/80 to-success",
  tour: "from-primary to-primary-light",
  hotel: "from-warning/80 to-warning",
  package: "from-accent to-accent-light",
  transfer: "from-slate-600 to-slate-700",
  pillar: "from-indigo-500 to-indigo-700",
};

const CATEGORY_ICON: Record<SearchCategory, typeof Wind> = {
  balloon: Wind,
  activity: MountainSnow,
  tour: TreePine,
  hotel: Hotel,
  package: PackageIcon,
  transfer: Car,
  pillar: BookOpen,
};

// CATEGORY_LABEL moved into SearchClient body as useCategoryLabel() — needs t

function ResultCard({ result }: { result: SearchResult }) {
  const t = useT();
  const ns = t.component.ara.search_client;
  const Icon = CATEGORY_ICON[result.type];
  const gradient = CATEGORY_GRADIENT[result.type];
  const CATEGORY_LABEL: Record<SearchCategory, string> = {
    balloon: ns.category_label_balloon,
    activity: ns.category_label_activity,
    tour: ns.category_label_tour,
    hotel: ns.category_label_hotel,
    package: ns.category_label_package,
    transfer: ns.category_label_transfer,
    pillar: ns.category_label_pillar,
  };
  return (
    <Link
      href={result.href}
      className="card overflow-hidden flex flex-col h-full hover:shadow-elevated transition-shadow"
    >
      <div
        className={cn(
          "relative h-32 bg-gradient-to-br flex items-center justify-center",
          gradient
        )}
      >
        <Icon className="w-12 h-12 text-white/85" strokeWidth={1.4} />
        <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-primary px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
          {CATEGORY_LABEL[result.type]}
        </span>
        {result.badge && (
          <span className="absolute top-2 right-2 bg-accent text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
            {result.badge}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
          {result.name}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-3 flex-1 line-clamp-3">
          {result.description}
        </p>
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {result.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-warning text-warning" />
                {result.rating}
              </span>
            )}
            {result.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {result.duration}
              </span>
            )}
          </div>
          {result.price !== null && result.currency && (
            <div className="text-sm font-extrabold text-primary">
              {formatPrice(result.price, result.currency)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function SearchClient({
  initialQuery,
  initialCategory,
  initialPriceMin,
  initialPriceMax,
  initialRatingMin,
  initialDuration,
  initialCurrency,
  initialSort,
}: {
  initialQuery: string;
  initialCategory: string;
  initialPriceMin?: number | null;
  initialPriceMax?: number | null;
  initialRatingMin?: number | null;
  initialDuration?: string;
  initialCurrency?: string;
  initialSort?: string;
}) {
  const t = useT();
  const ns = t.component.ara.search_client;

  const PRICE_CHIPS = PRICE_CHIP_DEFS.map((c) => ({
    ...c,
    label:
      c.id === "any"
        ? ns.price_chip_any
        : c.id === "0-50"
        ? ns.price_chip_0_50
        : c.id === "50-150"
        ? ns.price_chip_50_150
        : c.id === "150-300"
        ? ns.price_chip_150_300
        : ns.price_chip_300_plus,
  }));

  const RATING_CHIPS = RATING_CHIP_DEFS.map((c) => ({
    ...c,
    label:
      c.id === "any"
        ? ns.rating_chip_any
        : c.id === "3"
        ? ns.rating_chip_3
        : c.id === "4"
        ? ns.rating_chip_4
        : ns.rating_chip_4_5,
  }));

  const DURATION_CHIPS = DURATION_CHIP_DEFS.map((c) => ({
    ...c,
    label:
      c.id === "any"
        ? ns.duration_chip_any
        : c.id === "lt2h"
        ? ns.duration_chip_lt2h
        : c.id === "2to4h"
        ? ns.duration_chip_2to4h
        : c.id === "halfDay"
        ? ns.duration_chip_half_day
        : c.id === "fullDay"
        ? ns.duration_chip_full_day
        : ns.duration_chip_multi_day,
  }));

  const CURRENCY_CHIPS = CURRENCY_CHIP_DEFS.map((c) => ({
    ...c,
    label:
      c.id === "any"
        ? ns.currency_chip_any
        : c.id === "EUR"
        ? ns.currency_chip_eur
        : c.id === "TRY"
        ? ns.currency_chip_try
        : ns.currency_chip_usd,
  }));

  const SORT_OPTIONS = SORT_OPTION_DEFS.map((c) => ({
    ...c,
    label:
      c.id === "popularity"
        ? ns.sort_popularity
        : c.id === "priceAsc"
        ? ns.sort_price_asc
        : c.id === "priceDesc"
        ? ns.sort_price_desc
        : c.id === "ratingDesc"
        ? ns.sort_rating_desc
        : ns.sort_newest,
  }));

  const CATEGORY_TABS = CATEGORY_TAB_DEFS.map((c) => ({
    ...c,
    label:
      c.id === "all"
        ? ns.category_tab_all
        : c.id === "balloon"
        ? ns.category_tab_balloon
        : c.id === "package"
        ? ns.category_tab_package
        : c.id === "tour"
        ? ns.category_tab_tour
        : c.id === "activity"
        ? ns.category_tab_activity
        : c.id === "hotel"
        ? ns.category_tab_hotel
        : c.id === "transfer"
        ? ns.category_tab_transfer
        : ns.category_tab_pillar,
  }));

  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryFilter>(
    isCategoryFilter(initialCategory) ? initialCategory : "all"
  );
  const [priceMin, setPriceMin] = useState<number | null>(initialPriceMin ?? null);
  const [priceMax, setPriceMax] = useState<number | null>(initialPriceMax ?? null);
  const [ratingMin, setRatingMin] = useState<number | null>(initialRatingMin ?? null);
  const [duration, setDuration] = useState<DurationBucket>(
    initialDuration && isDurationBucket(initialDuration) ? initialDuration : "any"
  );
  const [currency, setCurrency] = useState<CurrencyFilter>(
    initialCurrency && isCurrency(initialCurrency) ? initialCurrency : "any"
  );
  const [sortBy, setSortBy] = useState<SortKey>(
    initialSort && isSortKey(initialSort) ? initialSort : "popularity"
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [recent, setRecent] = useState<RecentEntry[]>([]);

  useEffect(() => {
    setRecent(loadRecent());
    if (initialQuery) {
      setRecent(pushRecent(initialQuery));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "all") params.set("category", category);
    if (priceMin !== null) params.set("priceMin", String(priceMin));
    if (priceMax !== null) params.set("priceMax", String(priceMax));
    if (ratingMin !== null) params.set("rating", String(ratingMin));
    if (duration !== "any") params.set("duration", duration);
    if (currency !== "any") params.set("currency", currency);
    if (sortBy !== "popularity") params.set("sort", sortBy);
    const qs = params.toString();
    const target = qs ? `/ara?${qs}` : "/ara";
    const current = (() => {
      const p = new URLSearchParams();
      for (const key of ["q", "category", "priceMin", "priceMax", "rating", "duration", "currency", "sort"]) {
        const v = searchParams?.get(key);
        if (v) p.set(key, v);
      }
      return p.toString() ? `/ara?${p.toString()}` : "/ara";
    })();
    if (target !== current) {
      startTransition(() => {
        router.replace(target, { scroll: false });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, priceMin, priceMax, ratingMin, duration, currency, sortBy]);

  const filters: SearchFilters = useMemo(
    () => ({ category, priceMin, priceMax, ratingMin, duration, currency, sortBy }),
    [category, priceMin, priceMax, ratingMin, duration, currency, sortBy]
  );

  const results = useMemo(() => searchAll(query, filters), [query, filters]);
  const counts = useMemo(() => getCategoryCounts(query), [query]);
  const suggestions = useMemo(() => suggestFallback(4), []);

  const hasActiveFilters =
    category !== "all" ||
    priceMin !== null ||
    priceMax !== null ||
    ratingMin !== null ||
    duration !== "any" ||
    currency !== "any" ||
    sortBy !== "popularity";

  const activePriceChipId = useMemo(() => {
    const m = PRICE_CHIPS.find(
      (c) => c.min === priceMin && c.max === priceMax
    );
    return m?.id ?? "custom";
  }, [priceMin, priceMax]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) setRecent(pushRecent(trimmed));
  }

  function handleRecentClick(q: string) {
    setQuery(q);
    setRecent(pushRecent(q));
  }

  function handleClearRecent() {
    clearRecent();
    setRecent([]);
  }

  function handleClearFilters() {
    setCategory("all");
    setPriceMin(null);
    setPriceMax(null);
    setRatingMin(null);
    setDuration("any");
    setCurrency("any");
    setSortBy("popularity");
  }

  function applyPriceChip(chip: PriceChip) {
    setPriceMin(chip.min);
    setPriceMax(chip.max);
  }

  return (
    <div className="container-main py-8 sm:py-12">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          {query.trim() ? (
            <>
              {ns.heading_search_prefix} <span className="text-primary">&ldquo;{query.trim()}&rdquo;</span>
            </>
          ) : (
            ns.heading_search
          )}
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          {query.trim() || hasActiveFilters
            ? ns.results_count.replace("{count}", String(results.length))
            : ns.results_empty_hint}
        </p>
        <form onSubmit={handleSubmit} className="relative" role="search">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ns.search_placeholder}
            className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            aria-label={ns.search_aria_label}
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
              aria-label={ns.clear_search_aria_label}
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </form>

        {!query.trim() && recent.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {ns.recent_searches_heading}
              </p>
              <button
                onClick={handleClearRecent}
                className="text-xs text-slate-400 hover:text-rose-600"
              >
                {ns.recent_searches_clear}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <button
                  key={r.ts}
                  onClick={() => handleRecentClick(r.q)}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                >
                  {r.q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const count = counts[tab.id];
          const active = category === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all border",
                active
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors",
            filtersOpen
              ? "bg-primary text-white border-primary"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          )}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {ns.filters_button}
          {hasActiveFilters && (
            <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {ns.filters_active_badge}
            </span>
          )}
        </button>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <span className="text-slate-500">{ns.sort_label}</span>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(isSortKey(e.target.value) ? e.target.value : "popularity")
            }
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:border-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="ml-auto inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold"
          >
            <XIcon className="w-3.5 h-3.5" />
            {ns.clear_filters}
          </button>
        )}
      </div>

      {filtersOpen && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 space-y-5 shadow-sm">
          {/* Price chips */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {ns.filter_price_heading}
            </p>
            <div className="flex flex-wrap gap-2">
              {PRICE_CHIPS.map((chip) => {
                const active = activePriceChipId === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => applyPriceChip(chip)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      active
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-slate-500">{ns.filter_price_custom}</span>
              <input
                type="number"
                min="0"
                step="10"
                placeholder={ns.filter_price_min_placeholder}
                value={priceMin ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? null : parseInt(e.target.value, 10);
                  setPriceMin(Number.isFinite(v) ? v : null);
                }}
                className="w-24 px-2 py-1 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-primary"
              />
              <span className="text-slate-400">—</span>
              <input
                type="number"
                min="0"
                step="10"
                placeholder={ns.filter_price_max_placeholder}
                value={priceMax ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? null : parseInt(e.target.value, 10);
                  setPriceMax(Number.isFinite(v) ? v : null);
                }}
                className="w-24 px-2 py-1 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Rating chips */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {ns.filter_rating_heading}
            </p>
            <div className="flex flex-wrap gap-2">
              {RATING_CHIPS.map((chip) => {
                const active = (ratingMin ?? null) === chip.value;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setRatingMin(chip.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      active
                        ? "bg-warning text-white border-warning"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration chips */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {ns.filter_duration_heading}
            </p>
            <div className="flex flex-wrap gap-2">
              {DURATION_CHIPS.map((chip) => {
                const active = duration === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setDuration(chip.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      active
                        ? "bg-success text-white border-success"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency chips */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {ns.filter_currency_heading}
            </p>
            <div className="flex flex-wrap gap-2">
              {CURRENCY_CHIPS.map((chip) => {
                const active = currency === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setCurrency(chip.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      active
                        ? "bg-accent text-white border-accent"
                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {results.map((r) => (
            <ResultCard key={`${r.type}-${r.slug}`} result={r} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
            <SearchIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{ns.no_results_heading}</h2>
          <p className="text-sm text-slate-600 mb-8 max-w-md mx-auto">
            {query.trim() || hasActiveFilters ? (
              <>
                {ns.no_results_with_filters}
              </>
            ) : (
              ns.no_results_empty_query
            )}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mb-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
            >
              <XIcon className="w-4 h-4" />
              {ns.clear_filters}
            </button>
          )}
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4">
            {ns.suggestions_heading}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {suggestions.map((r) => (
              <ResultCard key={`sugg-${r.type}-${r.slug}`} result={r} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom "clear filters" CTA */}
      {hasActiveFilters && results.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-300"
          >
            <XIcon className="w-4 h-4" />
            {ns.clear_filters}
          </button>
        </div>
      )}
    </div>
  );
}
