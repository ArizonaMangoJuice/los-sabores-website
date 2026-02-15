"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import LanguageToggle from "./LanguageToggle";
import { SITE_NAME } from "@/lib/constants";
import { motion, AnimatePresence } from "motion/react";

const CHANNEL_LOGO =
  "https://yt3.ggpht.com/ytc/AIdro_mmlKfFRPNU40tFbHFsp4DhLiI2UZNQCb19f2lf2BYQZQY=s800-c-k-c0x00ffffff-no-rj";

export default function Header() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/" as const, label: t("home") },
    { href: "/recetas" as const, label: t("recipes") },
    { href: "/sobre" as const, label: t("about") },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-chocolate/5"
          : "bg-cream/80 backdrop-blur-md"
      } border-b border-warm-gray/10`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className={`relative w-9 h-9 rounded-full overflow-hidden transition-all ${
                scrolled
                  ? "ring-3 ring-terracotta/30"
                  : "ring-2 ring-terracotta/20 group-hover:ring-terracotta/50"
              }`}
            >
              <Image
                src={CHANNEL_LOGO}
                alt={SITE_NAME}
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <span className="font-heading font-bold text-lg text-chocolate group-hover:text-terracotta transition-colors hidden sm:block">
              {SITE_NAME}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:bg-terracotta after:rounded-full after:transition-all ${
                  isActive(link.href)
                    ? "text-terracotta after:w-full"
                    : "text-chocolate/80 hover:text-terracotta after:w-0 hover:after:w-full"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-chocolate hover:text-terracotta transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-warm-gray/10"
          >
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block text-lg font-medium transition-all py-3 px-3 rounded-xl ${
                      isActive(link.href)
                        ? "text-terracotta bg-terracotta/5 border-l-3 border-terracotta"
                        : "text-chocolate hover:text-terracotta hover:bg-terracotta/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
