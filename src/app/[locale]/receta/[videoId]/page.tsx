import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getVideoById } from "@/lib/videos";
import { getRecipeByVideoId } from "@/lib/recipes";
import YouTubeEmbed from "@/components/recipes/YouTubeEmbed";
import RecipeDetails from "@/components/recipes/RecipeDetails";
import Badge from "@/components/ui/Badge";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; videoId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, videoId } = await params;
  const video = await getVideoById(videoId);
  const recipe = await getRecipeByVideoId(videoId);

  const title =
    recipe?.[locale as "es" | "en"]?.title ?? video?.title ?? "Recipe";
  const description =
    recipe?.[locale as "es" | "en"]?.description ??
    video?.description?.slice(0, 160) ??
    "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: video?.thumbnailUrl ? [video.thumbnailUrl] : [],
      type: "article",
    },
  };
}

export default async function RecipePage({ params }: Props) {
  const { locale, videoId } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Recipes" });
  const tCat = await getTranslations({ locale, namespace: "Categories" });

  const video = await getVideoById(videoId);
  const recipe = await getRecipeByVideoId(videoId);

  if (!video) {
    return (
      <div className="py-20 text-center">
        <p className="text-warm-gray text-lg">Video not found</p>
        <Link
          href="/recetas"
          className="inline-flex items-center gap-2 mt-4 text-terracotta"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("viewAll")}
        </Link>
      </div>
    );
  }

  const localeData = recipe?.[locale as "es" | "en"];
  const title = localeData?.title ?? video.title;
  const description = localeData?.description ?? video.description;

  // JSON-LD for recipes
  const jsonLd = recipe
    ? {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: title,
        description,
        image: video.thumbnailUrl,
        author: {
          "@type": "Person",
          name: "Los Sabores de Mi Tierra",
        },
        prepTime: `PT${recipe.prepTime}M`,
        cookTime: `PT${recipe.cookTime}M`,
        totalTime: `PT${recipe.prepTime + recipe.cookTime}M`,
        recipeYield: `${recipe.servings}`,
        recipeCategory: recipe.category,
        recipeCuisine: "Latin American",
        recipeIngredient: localeData?.ingredients.flatMap((g) => g.items) ?? [],
        recipeInstructions:
          localeData?.steps.map((step, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            text: step,
          })) ?? [],
        video: {
          "@type": "VideoObject",
          name: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          uploadDate: video.publishedAt,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <article className="py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/recetas"
            className="inline-flex items-center gap-2 text-warm-gray hover:text-terracotta transition-colors mb-6 text-sm no-print"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("viewAll")}
          </Link>

          {/* Video */}
          <ScrollReveal>
            <YouTubeEmbed videoId={videoId} title={title} />
          </ScrollReveal>

          {/* Title + meta */}
          <ScrollReveal delay={0.1}>
            <div className="mt-8 mb-6">
              {recipe && (
                <Badge
                  category={recipe.category}
                  label={tCat(recipe.category)}
                  className="mb-3"
                />
              )}
              <h1 className="font-heading font-bold text-3xl md:text-4xl text-chocolate">
                {title}
              </h1>
              <p className="mt-3 text-warm-gray leading-relaxed">
                {description}
              </p>
            </div>
          </ScrollReveal>

          {/* Recipe details */}
          {recipe && (
            <ScrollReveal delay={0.2}>
              <RecipeDetails recipe={recipe} locale={locale} />
            </ScrollReveal>
          )}
        </div>
      </article>
    </>
  );
}
