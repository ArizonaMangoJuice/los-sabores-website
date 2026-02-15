"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";
import { Clock, Eye, ChefHat, ArrowRight } from "lucide-react";
import { parseDuration, formatViewCount } from "@/lib/utils";

interface RecipeCardProps {
  videoId: string;
  thumbnailUrl: string;
  title: string;
  category?: string;
  categoryLabel?: string;
  duration?: string;
  viewCount?: string;
  hasRecipe: boolean;
  prepTime?: number;
  cookTime?: number;
  difficulty?: "easy" | "medium" | "hard";
  servings?: number;
  ingredientCount?: number;
}

const difficultyColors = {
  easy: "text-cilantro bg-cilantro/10",
  medium: "text-terracotta bg-terracotta/10",
  hard: "text-chile-red bg-chile-red/10",
};

export default function RecipeCard({
  videoId,
  thumbnailUrl,
  title,
  category,
  categoryLabel,
  duration,
  viewCount,
  hasRecipe,
  prepTime,
  cookTime,
  difficulty,
}: RecipeCardProps) {
  const t = useTranslations("Recipes");
  const tDiff = useTranslations("Difficulty");
  const [imageLoaded, setImageLoaded] = useState(false);

  const totalTime = (prepTime || 0) + (cookTime || 0);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        href={{ pathname: "/receta/[videoId]", params: { videoId } }}
        className="group block bg-white rounded-2xl overflow-hidden card-glow shadow-sm hover:shadow-xl transition-all duration-300 border border-warm-gray/5 hover:border-terracotta/15"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-linen">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-linen animate-pulse" />
          )}
          <Image
            src={thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            fill
            className={`object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {category && (
            <div className="absolute top-3 left-3">
              <Badge category={category} label={categoryLabel} />
            </div>
          )}

          {duration && (
            <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3" />
              {parseDuration(duration)}
            </span>
          )}

          {hasRecipe && (
            <div className="absolute top-3 right-3 bg-cilantro/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg font-semibold shadow-sm">
              {t("fullRecipe")}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 pb-5">
          <h3 className="font-heading font-bold text-base text-chocolate line-clamp-2 group-hover:text-terracotta transition-colors duration-200 min-h-[3rem]">
            {title}
          </h3>

          {/* Recipe meta row */}
          {hasRecipe && totalTime > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <span className="flex items-center gap-1 text-xs text-warm-gray bg-linen px-2 py-1 rounded-lg">
                <Clock className="w-3 h-3 text-terracotta" />
                {totalTime} min
              </span>
              {difficulty && (
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${difficultyColors[difficulty]}`}>
                  <ChefHat className="w-3 h-3" />
                  {tDiff(difficulty)}
                </span>
              )}
            </div>
          )}

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-gray/8">
            {viewCount && (
              <span className="flex items-center gap-1 text-xs text-warm-gray">
                <Eye className="w-3.5 h-3.5" />
                {formatViewCount(viewCount)}
              </span>
            )}
            <span className="flex items-center gap-1 text-terracotta font-semibold text-xs group-hover:gap-2 transition-all">
              {hasRecipe ? t("viewRecipe") : t("watchVideo")}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
