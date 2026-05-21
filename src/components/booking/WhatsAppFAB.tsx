"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useT } from "@/lib/i18n/I18nProvider";

const WHATSAPP_HREF =
  "https://wa.me/905374647861?text=Merhaba,%20Trip%20and%20Tick%20hakkinda%20bilgi%20almak%20istiyorum.";

export function WhatsAppFAB() {
  const t = useT();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const expanded = hovered || focused;

  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className="fixed right-5 bottom-[80px] sm:bottom-6 z-40 flex items-center gap-2 rounded-full shadow-elevated transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]"
      style={{ backgroundColor: "#25D366" }}
    >
      <span className="w-14 h-14 rounded-full flex items-center justify-center text-white">
        <MessageCircle className="w-6 h-6" />
      </span>
      <span
        className={
          "overflow-hidden whitespace-nowrap text-white font-semibold text-sm pr-4 transition-all duration-200 " +
          (expanded ? "max-w-[260px] opacity-100" : "max-w-0 opacity-0")
        }
      >
        {t.component.booking.whats_app_f_a_b.bize_whatsapp_tan_yazin}
      </span>
    </a>
  );
}
