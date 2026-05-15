"use client";

import Link from "next/link";
import {
  Wind,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Shield,
  CreditCard,
  Globe,
} from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";

export function Footer() {
  const t = useT();

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
              <a href="mailto:info@tripandtick.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> info@tripandtick.com
              </a>
              <a href="tel:+905001234567" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> +90 500 123 45 67
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Göreme, Nevşehir, Türkiye
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-400 hover:bg-accent hover:text-white hover:border-accent transition-all"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
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
