"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Wind,
  Home,
  ArrowLeft,
  Search,
  MountainSnow,
  TreePine,
  Package,
  HelpCircle,
  Mail,
} from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";

const SUGGESTIONS = [
  { href: "/balonlar", key: "balonlar" as const, icon: Wind },
  { href: "/aktiviteler", key: "aktiviteler" as const, icon: MountainSnow },
  { href: "/turlar", key: "turlar" as const, icon: TreePine },
  { href: "/paketler", key: "paketler" as const, icon: Package },
  { href: "/sss", key: "sss" as const, icon: HelpCircle },
  { href: "/iletisim", key: "iletisim" as const, icon: Mail },
];

export default function NotFound() {
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    // /ara unified search sayfasi — tum hizmet katalogu uzerinde substring eslesme.
    router.push(`/ara?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white px-4 py-16">
      <div className="text-center max-w-3xl w-full">
        <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
          <Wind className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-7xl sm:text-9xl font-black mb-2 tracking-tight leading-none">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          {t.not_found.title}
        </h2>
        <p className="text-white/80 leading-relaxed mb-8 max-w-lg mx-auto">
          {t.not_found.message}
        </p>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-md mx-auto mb-10 relative"
          role="search"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.not_found.search_placeholder}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent/60 transition-all"
            aria-label={t.not_found.search_placeholder}
          />
        </form>

        {/* Suggestions Grid */}
        <p className="text-sm uppercase tracking-widest text-white/60 font-semibold mb-4">
          {t.not_found.suggestions_title}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10 max-w-2xl mx-auto">
          {SUGGESTIONS.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.06] border border-white/15 hover:bg-white/[0.12] hover:border-accent/40 transition-all"
            >
              <Icon className="w-6 h-6 text-accent-light group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-white">
                {t.not_found.suggestions[key]}
              </span>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 px-6 py-3 rounded-xl font-semibold text-white hover:bg-white/15 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> {t.not_found.back}
          </button>
          <Link
            href="/"
            className="btn-accent inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> {t.not_found.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
