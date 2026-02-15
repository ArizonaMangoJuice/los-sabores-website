"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const otherLocale = locale === "es" ? "en" : "es";

  function handleSwitch() {
    router.replace(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { pathname: pathname as any },
      { locale: otherLocale },
    );
  }

  return (
    <button
      onClick={handleSwitch}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-warm-gray/30 hover:border-terracotta hover:text-terracotta transition-colors text-sm font-medium"
      aria-label={`Switch to ${otherLocale === "en" ? "English" : "Spanish"}`}
    >
      <Globe className="w-4 h-4" />
      <span>{otherLocale.toUpperCase()}</span>
    </button>
  );
}
