"use client";

// Hizmet detayinda fiyatin yaninda ikinci CTA: tek tikla WhatsApp (FAB ile ayni
// prefill + Telegram bildirimi). Insan karar veremiyorsa sormak formdan kolay olmali.

import { usePathname } from "next/navigation";
import { useLocale, useT } from "@/lib/i18n/I18nProvider";
import { buildWhatsAppHref } from "@/lib/whatsapp";
import { reportClick, WhatsAppIcon } from "@/components/booking/WhatsAppFAB";

export function WhatsAppAskLink({ className = "" }: { className?: string }) {
  const { locale } = useLocale();
  const t = useT();
  const pathname = usePathname();
  return (
    <a
      href={buildWhatsAppHref(locale, pathname)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => reportClick(pathname, locale)}
      className={`inline-flex items-center justify-center gap-2 rounded-booking border-2 border-[#25D366]/40 px-5 py-3 text-sm font-bold text-[#128C7E] hover:bg-[#25D366]/10 transition ${className}`}
    >
      <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
      {t.component.booking.whats_app_f_a_b.bize_whatsapp_tan_yazin}
    </a>
  );
}
