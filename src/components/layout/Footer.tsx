"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Youtube, Heart, ArrowUp } from "lucide-react";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/constants";

const CHANNEL_LOGO =
  "https://yt3.ggpht.com/ytc/AIdro_mmlKfFRPNU40tFbHFsp4DhLiI2UZNQCb19f2lf2BYQZQY=s800-c-k-c0x00ffffff-no-rj";

export default function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");

  return (
    <footer className="bg-espresso text-linen/80 no-print relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-terracotta/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          {/* Brand column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-terracotta/30">
                <Image
                  src={CHANNEL_LOGO}
                  alt={SITE_NAME}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <span className="font-heading font-bold text-xl text-cream">
                {SITE_NAME}
              </span>
            </div>
            <p className="text-sm text-linen/50 max-w-sm leading-relaxed mb-6">
              {t("madeWith")}
            </p>
            <a
              href={SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-chile-red/15 border border-chile-red/25 text-chile-red rounded-full hover:bg-chile-red hover:text-white transition-all text-sm font-medium"
            >
              <Youtube className="w-4 h-4" />
              YouTube
            </a>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3">
            <h3 className="font-heading font-bold text-cream mb-5 text-sm uppercase tracking-wider">
              {t("quickLinks")}
            </h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/"
                className="text-sm text-linen/60 hover:text-corn-yellow hover:translate-x-1 transition-all"
              >
                {tNav("home")}
              </Link>
              <Link
                href="/recetas"
                className="text-sm text-linen/60 hover:text-corn-yellow hover:translate-x-1 transition-all"
              >
                {tNav("recipes")}
              </Link>
              <Link
                href="/sobre"
                className="text-sm text-linen/60 hover:text-corn-yellow hover:translate-x-1 transition-all"
              >
                {tNav("about")}
              </Link>
              <Link
                href="/privacidad"
                className="text-sm text-linen/60 hover:text-corn-yellow hover:translate-x-1 transition-all"
              >
                {t("privacy")}
              </Link>
            </nav>
          </div>

          {/* Social / Follow */}
          <div className="md:col-span-4">
            <h3 className="font-heading font-bold text-cream mb-5 text-sm uppercase tracking-wider">
              {t("followUs")}
            </h3>
            <p className="text-sm text-linen/50 leading-relaxed mb-5">
              {t("followDescription")}
            </p>
            <a
              href={SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-chile-red/15 border border-chile-red/25 text-chile-red rounded-full hover:bg-chile-red hover:text-white transition-all text-sm font-medium"
            >
              <Youtube className="w-4 h-4" />
              {t("subscribeYoutube")}
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-linen/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-linen/35">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. {t("rights")}.
          </p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1.5">
              {t("madeWith")} <Heart className="w-3 h-3 text-chile-red fill-chile-red" />
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] p-2 text-linen/40 hover:text-terracotta transition-colors rounded-full"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
