// next-intl routing config — defines locales, default, and prefix strategy.

import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["tr", "en", "de", "fr", "es", "nl", "zh", "hi", "ur"],
  defaultLocale: "tr",
  localePrefix: "as-needed",
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
