"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  Soup,
  UtensilsCrossed,
  Cake,
  Wine,
  Beef,
  Fish,
  Flame,
  Croissant,
  Salad,
  ChefHat,
  Egg,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  sopas: Soup,
  antojitos: UtensilsCrossed,
  postres: Cake,
  bebidas: Wine,
  carnes: Beef,
  mariscos: Fish,
  salsas: Flame,
  pan: Croissant,
  ensaladas: Salad,
  "platillo-fuerte": ChefHat,
  desayunos: Egg,
};

const colorMap: Record<string, { gradient: string; bg: string }> = {
  sopas: { gradient: "from-amber-400 to-amber-600", bg: "bg-amber-50" },
  antojitos: { gradient: "from-orange-400 to-orange-600", bg: "bg-orange-50" },
  postres: { gradient: "from-pink-400 to-pink-600", bg: "bg-pink-50" },
  bebidas: { gradient: "from-purple-400 to-purple-600", bg: "bg-purple-50" },
  carnes: { gradient: "from-red-400 to-red-600", bg: "bg-red-50" },
  mariscos: { gradient: "from-cyan-400 to-cyan-600", bg: "bg-cyan-50" },
  salsas: { gradient: "from-rose-400 to-rose-600", bg: "bg-rose-50" },
  pan: { gradient: "from-yellow-400 to-yellow-600", bg: "bg-yellow-50" },
  ensaladas: { gradient: "from-green-400 to-green-600", bg: "bg-green-50" },
  "platillo-fuerte": { gradient: "from-stone-400 to-stone-600", bg: "bg-stone-50" },
  desayunos: { gradient: "from-sky-400 to-sky-600", bg: "bg-sky-50" },
};

interface CategoryShowcaseProps {
  recipeCounts?: Record<string, number>;
}

export default function CategoryShowcase({ recipeCounts }: CategoryShowcaseProps) {
  const t = useTranslations("Recipes");
  const tCat = useTranslations("Categories");

  return (
    <section className="py-16 md:py-24 bg-linen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-chocolate">
              {t("categories")}
            </h2>
            <div className="w-16 h-1 bg-terracotta mt-3 mx-auto rounded-full" />
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = iconMap[cat] || ChefHat;
            const colors = colorMap[cat] || { gradient: "from-gray-400 to-gray-600", bg: "bg-gray-50" };
            const count = recipeCounts?.[cat] ?? 0;
            return (
              <ScrollReveal key={cat} delay={i * 0.05}>
                <Link href="/recetas">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex flex-col items-center gap-3 p-5 ${colors.bg} rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer border border-transparent hover:border-warm-gray/10`}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-chocolate text-center leading-tight">
                      {tCat(cat)}
                    </span>
                    {count > 0 && (
                      <span className="text-xs text-warm-gray">
                        {count} {count === 1 ? "receta" : "recetas"}
                      </span>
                    )}
                  </motion.div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
