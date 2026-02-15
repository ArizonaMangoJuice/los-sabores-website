"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import RecipeCard from "./RecipeCard";
import { Search } from "lucide-react";
import { VideoDetails, Recipe } from "@/types";
import { CATEGORIES } from "@/lib/constants";

interface RecipeGridProps {
  videos: VideoDetails[];
  recipes: Recipe[];
}

export default function RecipeGrid({ videos, recipes }: RecipeGridProps) {
  const t = useTranslations("Recipes");
  const tCat = useTranslations("Categories");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showOnlyRecipes, setShowOnlyRecipes] = useState(false);

  const recipeMap = new Map(recipes.map((r) => [r.videoId, r]));

  const filteredVideos = videos
    .filter((video) => {
      const recipe = recipeMap.get(video.id);

      // Filter: only show videos with recipes
      if (showOnlyRecipes && !recipe) return false;

      const recipeTitle = recipe
        ? locale === "es"
          ? recipe.es.title
          : recipe.en.title
        : "";

      const matchesSearch =
        search === "" ||
        video.title.toLowerCase().includes(search.toLowerCase()) ||
        recipeTitle.toLowerCase().includes(search.toLowerCase()) ||
        video.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "all" ||
        (recipe && recipe.category === activeCategory);

      return matchesSearch && matchesCategory;
    })
    // Sort: recipes first, then by date
    .sort((a, b) => {
      const aHasRecipe = recipeMap.has(a.id) ? 1 : 0;
      const bHasRecipe = recipeMap.has(b.id) ? 1 : 0;
      if (bHasRecipe !== aHasRecipe) return bHasRecipe - aHasRecipe;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  const recipeCount = videos.filter((v) => recipeMap.has(v.id)).length;

  return (
    <div className="space-y-6">
      {/* Search + Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-warm-gray/20 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-all text-sm"
          />
        </div>
        <button
          onClick={() => setShowOnlyRecipes(!showOnlyRecipes)}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
            showOnlyRecipes
              ? "bg-avocado text-white border-avocado shadow-md"
              : "bg-white text-chocolate border-warm-gray/20 hover:border-avocado hover:text-avocado"
          }`}
        >
          {showOnlyRecipes
            ? `${t("fullRecipe")} (${recipeCount})`
            : `${t("fullRecipe")} (${recipeCount})`}
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            activeCategory === "all"
              ? "bg-terracotta text-white shadow-md"
              : "bg-linen text-chocolate hover:bg-terracotta/10"
          }`}
        >
          {t("allCategories")}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-terracotta text-white shadow-md"
                : "bg-linen text-chocolate hover:bg-terracotta/10"
            }`}
          >
            {tCat(cat)}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-warm-gray">
        {filteredVideos.length} {locale === "es" ? "resultados" : "results"}
      </p>

      {/* Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-warm-gray text-lg">{t("noResults")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => {
            const recipe = recipeMap.get(video.id);
            return (
              <RecipeCard
                key={video.id}
                videoId={video.id}
                thumbnailUrl={video.thumbnailUrl}
                title={
                  recipe
                    ? locale === "es"
                      ? recipe.es.title
                      : recipe.en.title
                    : video.title
                }
                category={recipe?.category}
                categoryLabel={recipe ? tCat(recipe.category) : undefined}
                duration={video.duration}
                viewCount={video.viewCount}
                hasRecipe={!!recipe}
                prepTime={recipe?.prepTime}
                cookTime={recipe?.cookTime}
                difficulty={recipe?.difficulty}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
