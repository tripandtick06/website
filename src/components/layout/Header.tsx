"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Menu,
  X,
  ChevronDown,
  Wind,
  Hotel,
  Car,
  Bike,
  TreePine,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/balonlar", label: "Balon Turları", icon: Wind },
  { href: "/oteller", label: "Oteller", icon: Hotel },
  { href: "/aktiviteler", label: "Aktiviteler", icon: Bike },
  { href: "/turlar", label: "Gezi Turları", icon: TreePine },
  { href: "/paketler", label: "Paketler", icon: Package },
];

const LANGUAGES = [
  { code: "tr", label: "Türkçe", flag: "TR" },
  { code: "en", label: "English", flag: "EN" },
  { code: "de", label: "Deutsch", flag: "DE" },
  { code: "fr", label: "Français", flag: "FR" },
  { code: "es", label: "Español", flag: "ES" },
  { code: "nl", label: "Nederlands", flag: "NL" },
  { code: "zh", label: "中文", flag: "ZH" },
  { code: "hi", label: "हिन्दी", flag: "HI" },
  { code: "ur", label: "اردو", flag: "UR" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("tr");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/[0.97] backdrop-blur-xl border-b border-white/[0.06]">
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
            Blog
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-white text-sm font-medium hover:bg-white/15 transition-all"
            >
              <Globe className="w-4 h-4" />
              {currentLang.toUpperCase()}
              <ChevronDown className="w-3 h-3" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-elevated border border-slate-100 py-2 z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setLangOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-between",
                      currentLang === lang.code
                        ? "text-primary bg-primary/5"
                        : "text-slate-700"
                    )}
                  >
                    <span>{lang.label}</span>
                    <span className="text-xs text-slate-400 font-mono">{lang.flag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <Link
            href="/balonlar"
            className="hidden sm:inline-flex btn-accent text-sm !py-2 !px-5"
          >
            Rezervasyon Yap
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white"
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
            <span className="font-medium">Blog</span>
          </Link>
          <div className="mt-4 px-4">
            <Link href="/balonlar" className="btn-accent w-full block text-center">
              Rezervasyon Yap
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
