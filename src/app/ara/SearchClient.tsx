"use client";

// Interactive site search — reads/writes URL ?q= ?category= and persists recent queries.
//
// Importers:
//   - src/app/ara/page.tsx (server shell renders <SearchClient ... />)
// Affected: client-side substring search UI + recent-searches localStorage.
// Data:
//   - localStorage key "tripandtick:recent-searches" = JSON array of {q: string, ts: ISO 8601}.
//   - Max 8 entries, dedup by case-insensitive q.
// User verbatim: "Search input + kategori filtreleri... URL state sync (push query)...
// Recent searches localStorage 'tripandtick:recent-searches'.
// Empty state: 'Sonuc bulunamadi' + 4 oneri kart."

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import {
  searchAll,
  getCategoryCounts,
  suggestFallback,
  type SearchCategory,
  type SearchResult,
} from "@/lib/search";
import { formatPrice, cn } from "@/lib/utils";

const RECENT_KEY = "tripandtick:recent-searches";
const RECENT_MAX = 8;

type CategoryFilter = SearchCategory | "all";

const CATEGORY_TABS: { id: CategoryFilter; label: string; icon: typeof Wind }[] = [
  { id: "all", label: "Tümü", icon: SearchIcon },
  { id: "balloon", label: "Balon", icon: Wind },
  { id: "package", label: "Paket", icon: PackageIcon },
  { id: "tour", label: "Tur", icon: TreePine },
  { id: "activity", label: "Aktivite", icon: MountainSnow },
  { id: "hotel", label: "Otel", icon: Hotel },
  { id: "transfer", label: "Transfer", icon: Car },
  { id: "pillar", label: "Rehber", icon: BookOpen },
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

const CATEGORY_LABEL: Record<SearchCategory, string> = {
  balloon: "Balon",
  activity: "Aktivite",
  tour: "Tur",
  hotel: "Otel",
  package: "Paket",
  transfer: "Transfer",
  pillar: "Rehber",
};

function ResultCard({ result }: { result: SearchResult }) {
  const Icon = CATEGORY_ICON[result.type];
  const gradient = CATEGORY_GRADIENT[result.type];
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
}: {
  initialQuery: string;
  initialCategory: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<CategoryFilter>(
    isCategoryFilter(initialCategory) ? initialCategory : "all"
  );
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
    const qs = params.toString();
    const target = qs ? `/ara?${qs}` : "/ara";
    const current = (() => {
      const p = new URLSearchParams();
      const cq = searchParams?.get("q");
      const cc = searchParams?.get("category");
      if (cq) p.set("q", cq);
      if (cc) p.set("category", cc);
      return p.toString() ? `/ara?${p.toString()}` : "/ara";
    })();
    if (target !== current) {
      startTransition(() => {
        router.replace(target, { scroll: false });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  const results = useMemo(() => searchAll(query, category), [query, category]);
  const counts = useMemo(() => getCategoryCounts(query), [query]);
  const suggestions = useMemo(() => suggestFallback(4), []);

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

  return (
    <div className="container-main py-8 sm:py-12">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          {query.trim() ? (
            <>
              Arama: <span className="text-primary">&ldquo;{query.trim()}&rdquo;</span>
            </>
          ) : (
            "Arama"
          )}
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          {query.trim()
            ? `${results.length} sonuç bulundu.`
            : "Balon turu, otel, aktivite, paket veya transfer arayın."}
        </p>
        <form onSubmit={handleSubmit} className="relative" role="search">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Örn: balon, deluxe, atv, mağara otel, kırmızı tur…"
            className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-slate-200 bg-white text-base focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            aria-label="Arama kutusu"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
              aria-label="Aramayı temizle"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </form>

        {!query.trim() && recent.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Son Aramalar
              </p>
              <button
                onClick={handleClearRecent}
                className="text-xs text-slate-400 hover:text-rose-600"
              >
                Temizle
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

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
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
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sonuç bulunamadı</h2>
          <p className="text-sm text-slate-600 mb-8 max-w-md mx-auto">
            {query.trim() ? (
              <>
                &ldquo;<strong>{query.trim()}</strong>&rdquo; için sonuç yok. Farklı bir
                kelime veya kategori deneyin.
              </>
            ) : (
              "Aramaya başlamak için bir kelime girin."
            )}
          </p>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4">
            Önerilenler
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {suggestions.map((r) => (
              <ResultCard key={`sugg-${r.type}-${r.slug}`} result={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
