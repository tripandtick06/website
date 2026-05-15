"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Globe,
  Menu,
  X,
  ChevronDown,
  Wind,
  Hotel,
  Car,
  MountainSnow,
  TreePine,
  Package,
  UserCircle,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale, useT } from "@/lib/i18n/I18nProvider";
import { isLocale } from "@/lib/i18n/dictionaries";

type LangEntry = {
  code: string;
  label: string;
  flag: string;
  disabled: boolean;
};

const LANGUAGES: LangEntry[] = [
  { code: "tr", label: "Türkçe", flag: "TR", disabled: false },
  { code: "en", label: "English", flag: "EN", disabled: false },
  { code: "de", label: "Deutsch", flag: "DE", disabled: true },
  { code: "fr", label: "Français", flag: "FR", disabled: true },
  { code: "es", label: "Español", flag: "ES", disabled: true },
  { code: "nl", label: "Nederlands", flag: "NL", disabled: true },
  { code: "zh", label: "中文", flag: "ZH", disabled: true },
  { code: "hi", label: "हिन्दी", flag: "HI", disabled: true },
  { code: "ur", label: "اردو", flag: "UR", disabled: true },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { locale, setLocale } = useLocale();
  const t = useT();
  const langWrapperRef = useRef<HTMLDivElement | null>(null);
  const mobileWrapperRef = useRef<HTMLDivElement | null>(null);

  // Click-outside + Escape close (langOpen + mobileOpen)
  useEffect(() => {
    if (!langOpen && !mobileOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (
        langOpen &&
        langWrapperRef.current &&
        target &&
        !langWrapperRef.current.contains(target)
      ) {
        setLangOpen(false);
      }
      if (
        mobileOpen &&
        mobileWrapperRef.current &&
        target &&
        !mobileWrapperRef.current.contains(target)
      ) {
        setMobileOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (langOpen) setLangOpen(false);
        if (mobileOpen) setMobileOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [langOpen, mobileOpen]);

  const NAV_ITEMS = [
    { href: "/balonlar", label: t.nav.balloons, icon: Wind },
    { href: "/oteller", label: t.nav.hotels, icon: Hotel },
    { href: "/aktiviteler", label: t.nav.activities, icon: MountainSnow },
    { href: "/turlar", label: t.nav.tours, icon: TreePine },
    { href: "/paketler", label: t.nav.packages, icon: Package },
  ];

  // Mevcut nav-row kalabaligini onlemek icin "Rezervasyonum" link'i sadece mobile-menu'da gosterilir.

  return (
    <header
      ref={mobileWrapperRef}
      className="fixed top-0 left-0 right-0 z-50 bg-primary/[0.97] backdrop-blur-xl border-b border-white/[0.06]"
    >
      <div className="container-main flex items-center justify-between h-[68px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <Wind className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">
            Trip and <span className="text-accent">Tick</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <Link
            href="/blog"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/75 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            {t.nav.blog}
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <Link
            href="/ara"
            className="p-2 rounded-lg text-white/75 hover:text-white hover:bg-white/[0.08] transition-all"
            aria-label="Arama"
            title="Arama"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Language Switcher */}
          <div className="relative" ref={langWrapperRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm font-medium hover:bg-white/15 transition-all"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              <Globe className="w-4 h-4" />
              {locale.toUpperCase()}
              <ChevronDown className="w-3 h-3" />
            </button>
            {langOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-elevated border border-slate-100 py-2 z-50"
                role="listbox"
              >
                {LANGUAGES.map((lang) => {
                  const isActive = locale === lang.code;
                  if (lang.disabled) {
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        disabled
                        title="Faz 2'de eklenecek"
                        className="w-full text-left px-4 py-2 text-sm font-medium text-slate-400 opacity-50 cursor-not-allowed flex items-center justify-between"
                      >
                        <span>{lang.label}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          Yakında
                        </span>
                      </button>
                    );
                  }
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        if (isLocale(lang.code)) {
                          setLocale(lang.code);
                        }
                        setLangOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-between",
                        isActive
                          ? "text-primary bg-primary/5"
                          : "text-slate-700"
                      )}
                    >
                      <span>{lang.label}</span>
                      <span className="text-xs text-slate-400 font-mono">{lang.flag}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hesabim (desktop) */}
          <Link
            href="/hesabim"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/[0.08] text-sm font-medium transition-all"
            title="Rezervasyonum"
            aria-label="Rezervasyonum"
          >
            <UserCircle className="w-4 h-4" />
            <span className="hidden xl:inline">Rezervasyonum</span>
          </Link>

          {/* CTA */}
          <Link
            href="/balonlar"
            className="hidden sm:inline-flex btn-accent text-sm !py-2 !px-5"
          >
            {t.common.reserve}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-primary-dark border-t border-white/10 px-4 pb-6 pt-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          <Link
            href="/blog"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
          >
            <span className="font-medium">{t.nav.blog}</span>
          </Link>
          <Link
            href="/hesabim"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/[0.06] rounded-lg transition-all"
          >
            <UserCircle className="w-5 h-5" />
            <span className="font-medium">Rezervasyonum</span>
          </Link>
          <div className="mt-4 px-4">
            <Link href="/balonlar" className="btn-accent w-full block text-center">
              {t.common.reserve}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
