"use client";

// Fiyatin yanindaki WhatsApp CTA — her fiyat etiketi Murat'a tek tik uzaklikta olsun
// (FAB ile ayni prefill + Telegram bildirimi). `subject` = urun adi: listing sayfasinda
// URL urunu soylemez, prefill'in ilk satiri soyler. `compact` = kart ici kisa buton
// (ikon + "WhatsApp"), detay sayfasinda tam etiket.

import { usePathname } from "next/navigation";
import { useLocale, useT } from "@/lib/i18n/I18nProvider";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { reportClick, WhatsAppIcon } from "@/components/booking/WhatsAppFAB";

export interface WhatsAppAskLinkProps {
  className?: string;
  /** Urun/hizmet adi — WhatsApp on-mesajina eklenir. */
  subject?: string;
  /** Kart ici kisa varyant: ikon + "WhatsApp". */
  compact?: boolean;
}

export function WhatsAppAskLink({ className = "", subject, compact = false }: WhatsAppAskLinkProps) {
  const { locale } = useLocale();
  const t = useT();
  const pathname = usePathname();
  const label = t.component.booking.whats_app_f_a_b.bize_whatsapp_tan_yazin;
  const href = buildWhatsAppHref(locale, pathname, subject);

  if (compact) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => reportClick(pathname, locale)}
        aria-label={subject ? `${label} — ${subject}` : label}
        title={label}
        className={`inline-flex items-center justify-center gap-1.5 rounded-booking border-2 border-[#25D366]/40 px-3 py-2 text-sm font-bold text-[#128C7E] hover:bg-[#25D366]/10 transition ${className}`}
      >
        <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
        WhatsApp
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => reportClick(pathname, locale)}
      className={`inline-flex items-center justify-center gap-2 rounded-booking border-2 border-[#25D366]/40 px-5 py-3 text-sm font-bold text-[#128C7E] hover:bg-[#25D366]/10 transition ${className}`}
    >
      <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
      {label}
    </a>
  );
}
