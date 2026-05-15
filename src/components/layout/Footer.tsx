"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Wind,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Shield,
  CreditCard,
  Globe,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale, useT } from "@/lib/i18n/I18nProvider";
import { isLocale } from "@/lib/i18n/dictionaries";
import { COMPANY, telHref, whatsappHref } from "@/data/founder";
import { CurrencySwitcher } from "@/components/booking/CurrencySwitcher";

type FooterLang = {
  code: string;
  label: string;
  flag: string;
  disabled: boolean;
};

const FOOTER_LANGUAGES: FooterLang[] = [
  { code: "tr", label: "Türkçe", flag: "TR", disabled: false },
  { code: "en", label: "English", flag: "EN", disabled: false },
  { code: "de", label: "Deutsch", flag: "DE", disabled: false },
  { code: "fr", label: "Français", flag: "FR", disabled: false },
  { code: "es", label: "Español", flag: "ES", disabled: false },
  { code: "nl", label: "Nederlands", flag: "NL", disabled: false },
  { code: "zh", label: "中文", flag: "ZH", disabled: false },
  { code: "hi", label: "हिन्दी", flag: "HI", disabled: false },
  { code: "ur", label: "اردو", flag: "UR", disabled: false },
];

export function Footer() {
  const t = useT();
  const { locale, setLocale } = useLocale();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement | null>(null);

  // Click-outside close
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen]);

  const FOOTER_SERVICES = [
    { href: "/balonlar", label: t.nav.balloons },
    { href: "/oteller", label: t.nav.hotels },
    { href: "/aktiviteler", label: t.nav.activities },
    { href: "/turlar", label: t.nav.tours },
    { href: "/paketler", label: t.nav.packages },
    { href: "/transferler", label: "Transfer" },
  ];

  const FOOTER_COMPANY = [
    { href: "/hakkimizda", label: t.nav.about },
    { href: "/blog", label: t.nav.blog },
    { href: "/iletisim", label: t.nav.contact },
    { href: "/sss", label: t.nav.faq },
    { href: "/hesabim", label: "Rezervasyonum" },
    { href: "/b2b", label: "B2B Acente" },
  ];

  const FOOTER_LEGAL = [
    { href: "/iptal-iade-politikasi", label: "İptal & İade" },
    { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
    { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
    { href: "/cerez-politikasi", label: "KVKK & Çerezler" },
  ];

  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Trust Bar */}
      <div className="border-b border-slate-800">
        <div className="container-main py-6 flex flex-wrap items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            <span>{t.trust.refund}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent" />
            <span>{t.trust.secure}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            <span>{t.trust.insurance}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" />
            <span>{t.trust.languages}</span>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-main py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Wind className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold text-white">
                Trip and Tick
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              Kapadokya&apos;nın en rekabetçi fiyatlı, en güvenilir online seyahat acentası.
              Nevşehir / Göreme, Türkiye.
            </p>
            <div className="space-y-2 text-sm">
              <a
                href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" /> {COMPANY.email}
              </a>
              <a
                href={telHref(COMPANY.phone)}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" /> {COMPANY.phone}
              </a>
              <a
                href={whatsappHref(COMPANY.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {COMPANY.address.locality},{" "}
                {COMPANY.address.region}, Türkiye
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              {[
                { Icon: Instagram, href: COMPANY.social.instagram, label: "Instagram" },
                { Icon: Facebook, href: COMPANY.social.facebook, label: "Facebook" },
                { Icon: Twitter, href: COMPANY.social.twitter, label: "Twitter" },
                { Icon: Youtube, href: COMPANY.social.youtube, label: "YouTube" },
                { Icon: Linkedin, href: COMPANY.social.linkedin, label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-400 hover:bg-accent hover:text-white hover:border-accent transition-all"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}

              {/* Currency switcher */}
              <div className="ml-auto">
                <CurrencySwitcher variant="footer" />
              </div>

              {/* Dil dropdown — Header ile sync */}
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setLangOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/[0.12] hover:text-white transition-all"
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                  aria-label="Dil seç"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {locale.toUpperCase()}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {langOpen && (
                  <div
                    className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-xl shadow-elevated border border-slate-100 py-2 z-50"
                    role="listbox"
                  >
                    {FOOTER_LANGUAGES.map((lang) => {
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
                          <span className="text-xs text-slate-400 font-mono">
                            {lang.flag}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4">{t.footer.services}</h5>
            {FOOTER_SERVICES.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-sm py-1.5 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4">{t.footer.company}</h5>
            {FOOTER_COMPANY.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-sm py-1.5 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4">{t.footer.legal}</h5>
            {FOOTER_LEGAL.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block text-sm py-1.5 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span>© 2026 Trip and Tick. {t.footer.rights}</span>
          <span className="text-slate-500">Nevşehir / Kapadokya, Türkiye</span>
        </div>
      </div>
    </footer>
  );
}
