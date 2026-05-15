"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/I18nProvider";

export function MobileStickyCTA() {
  const t = useT();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-primary p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      <Link
        href="/balonlar"
        className="w-full btn-accent !py-3.5 text-base block text-center"
      >
        {t.cta.mobile}
      </Link>
    </div>
  );
}

export default MobileStickyCTA;
