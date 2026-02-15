"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { Play, ChevronDown } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

const CHANNEL_LOGO =
  "https://yt3.ggpht.com/ytc/AIdro_mmlKfFRPNU40tFbHFsp4DhLiI2UZNQCb19f2lf2BYQZQY=s800-c-k-c0x00ffffff-no-rj";
const CHANNEL_BANNER =
  "https://yt3.googleusercontent.com/fImzRdG9DH63auuO6IbzqoQY5oaygPurOLh6Xbg6wwKLnrN4TzTxWBrbTVT5cFLbJf3jJnFa9Q";

interface HeroSectionProps {
  latestVideoId?: string;
  latestVideoTitle?: string;
}

export default function HeroSection({
  latestVideoId,
  latestVideoTitle,
}: HeroSectionProps) {
  const t = useTranslations("Hero");

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Banner background image */}
      <div className="absolute inset-0">
        <Image
          src={CHANNEL_BANNER}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-espresso/80 via-chocolate/70 to-espresso/90" />

      {/* Decorative elements */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-terracotta/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-corn-yellow/8 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-chile-red/10 rounded-full blur-[80px]" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Channel logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl shadow-black/30">
            <Image
              src={CHANNEL_LOGO}
              alt={SITE_NAME}
              fill
              className="object-cover"
              sizes="112px"
              priority
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span className="inline-block text-corn-yellow text-sm font-semibold tracking-[0.25em] uppercase mb-4">
            {SITE_NAME}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-heading font-extrabold text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6 drop-shadow-lg"
        >
          {t("tagline")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/recetas"
            className="px-8 py-4 bg-terracotta text-white font-semibold rounded-full hover:bg-terracotta-light transition-all shadow-xl shadow-terracotta/25 text-lg hover:shadow-terracotta/40 hover:-translate-y-0.5"
          >
            {t("cta")}
          </Link>

          {latestVideoId && (
            <a
              href={`https://www.youtube.com/watch?v=${latestVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full hover:bg-white/20 transition-all group"
            >
              <div className="w-10 h-10 bg-chile-red rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-chile-red/30">
                <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
              </div>
              <span className="text-sm font-medium">
                {t("watchLatest")}
              </span>
            </a>
          )}
        </motion.div>

        {latestVideoTitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 text-sm text-white/40 italic"
          >
            &ldquo;{latestVideoTitle}&rdquo;
          </motion.p>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
