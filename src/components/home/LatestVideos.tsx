import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { VideoDetails, Recipe } from "@/types";
import RecipeCard from "@/components/recipes/RecipeCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ArrowRight } from "lucide-react";

interface LatestVideosProps {
  videos: VideoDetails[];
  recipes: Recipe[];
  locale: string;
}

export default function LatestVideos({
  videos,
  recipes,
  locale,
}: LatestVideosProps) {
  const t = useTranslations("Recipes");
  const tCat = useTranslations("Categories");
  const recipeMap = new Map(recipes.map((r) => [r.videoId, r]));

  return (
    <section className="py-16 md:py-24 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream via-linen/50 to-cream" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-terracotta text-sm font-semibold uppercase tracking-wider">
                {t("latestVideos")}
              </span>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-chocolate mt-1">
                {t("latestVideos")}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-terracotta to-corn-yellow mt-4 rounded-full" />
            </div>
            <Link
              href="/recetas"
              className="hidden sm:flex items-center gap-2 text-terracotta font-semibold hover:gap-3 transition-all group"
            >
              {t("viewAll")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {videos.slice(0, 6).map((video, i) => {
            const recipe = recipeMap.get(video.id);
            return (
              <ScrollReveal key={video.id} delay={i * 0.08}>
                <RecipeCard
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
              </ScrollReveal>
            );
          })}
        </div>

        <div className="sm:hidden mt-10 text-center">
          <Link
            href="/recetas"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-terracotta text-white rounded-full font-semibold shadow-lg shadow-terracotta/20 hover:shadow-terracotta/30 hover:-translate-y-0.5 transition-all"
          >
            {t("viewAll")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
