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

const colorMap: Record<string, string> = {
  sopas: "from-amber-400 to-amber-600",
  antojitos: "from-orange-400 to-orange-600",
  postres: "from-pink-400 to-pink-600",
  bebidas: "from-purple-400 to-purple-600",
  carnes: "from-red-400 to-red-600",
  mariscos: "from-cyan-400 to-cyan-600",
  salsas: "from-rose-400 to-rose-600",
  pan: "from-yellow-400 to-yellow-600",
  ensaladas: "from-green-400 to-green-600",
  "platillo-fuerte": "from-stone-400 to-stone-600",
  desayunos: "from-sky-400 to-sky-600",
};

export default function CategoryShowcase() {
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
            return (
              <ScrollReveal key={cat} delay={i * 0.05}>
                <Link href="/recetas">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[cat] || "from-gray-400 to-gray-600"} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-chocolate text-center">
                      {tCat(cat)}
                    </span>
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
