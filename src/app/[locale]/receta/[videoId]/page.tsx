import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getVideoById, getAllVideos } from "@/lib/videos";
import { getRecipeByVideoId, getAllRecipes } from "@/lib/recipes";
import YouTubeEmbed from "@/components/recipes/YouTubeEmbed";
import RecipeDetails from "@/components/recipes/RecipeDetails";
import RecipeCard from "@/components/recipes/RecipeCard";
import Badge from "@/components/ui/Badge";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import AdUnit from "@/components/ads/AdUnit";
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

  const esPath = `/es/receta/${videoId}`;
  const enPath = `/en/recipe/${videoId}`;
  const currentPath = locale === "es" ? esPath : enPath;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: video?.thumbnailUrl
        ? [{ url: video.thumbnailUrl, width: 480, height: 360, alt: title }]
        : [],
      type: "article",
      siteName: SITE_NAME,
      locale: locale === "es" ? "es_MX" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: video?.thumbnailUrl ? [video.thumbnailUrl] : [],
    },
    alternates: {
      canonical: `${SITE_URL}${currentPath}`,
      languages: {
        es: `${SITE_URL}${esPath}`,
        en: `${SITE_URL}${enPath}`,
      },
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
          url: "https://www.youtube.com/@lossaboresdemitierra8378",
        },
        datePublished: video.publishedAt,
        prepTime: `PT${recipe.prepTime}M`,
        cookTime: `PT${recipe.cookTime}M`,
        totalTime: `PT${recipe.prepTime + recipe.cookTime}M`,
        recipeYield: `${recipe.servings} porciones`,
        recipeCategory: recipe.category,
        recipeCuisine: "Latin American",
        keywords: recipe.tags?.join(", ") ?? recipe.category,
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
          description: video.description?.slice(0, 200),
          thumbnailUrl: video.thumbnailUrl,
          uploadDate: video.publishedAt,
          contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
        },
      }
    : null;

  // BreadcrumbList JSON-LD
  const recipesLabel = locale === "es" ? "Recetas" : "Recipes";
  const recipesPath = locale === "es" ? "/es/recetas" : "/en/recipes";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "es" ? "Inicio" : "Home",
        item: `${SITE_URL}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: recipesLabel,
        item: `${SITE_URL}${recipesPath}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
      },
    ],
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

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

          {/* Ad between video and recipe */}
          <div className="my-6 no-print">
            <AdUnit
              slot={process.env.NEXT_PUBLIC_AD_SLOT_ARTICLE || ""}
              format="auto"
              className="rounded-xl"
            />
          </div>

          {/* Recipe details */}
          {recipe && (
            <ScrollReveal delay={0.2}>
              <RecipeDetails recipe={recipe} locale={locale} />
            </ScrollReveal>
          )}

          {/* Ad after recipe */}
          <div className="mt-10 no-print">
            <AdUnit
              slot={process.env.NEXT_PUBLIC_AD_SLOT_BANNER || ""}
              format="auto"
              className="rounded-xl"
            />
          </div>

          {/* Related recipes */}
          {recipe && (
            <RelatedRecipes
              currentVideoId={videoId}
              category={recipe.category}
              locale={locale}
              label={t("relatedRecipes")}
            />
          )}
        </div>
      </article>
    </>
  );
}

async function RelatedRecipes({
  currentVideoId,
  category,
  locale,
  label,
}: {
  currentVideoId: string;
  category: string;
  locale: string;
  label: string;
}) {
  const allRecipes = await getAllRecipes();
  const allVideos = await getAllVideos();

  // Get recipes from the same category, excluding current
  let related = allRecipes.filter(
    (r) => r.category === category && r.videoId !== currentVideoId,
  );

  // If not enough, fill with random recipes
  if (related.length < 3) {
    const others = allRecipes.filter(
      (r) => r.videoId !== currentVideoId && r.category !== category,
    );
    related = [...related, ...others.slice(0, 3 - related.length)];
  }

  related = related.slice(0, 3);

  if (related.length === 0) return null;

  const videoMap = new Map(allVideos.map((v) => [v.id, v]));
  const tCat = await getTranslations({ locale, namespace: "Categories" });

  return (
    <div className="mt-16 pt-10 border-t border-warm-gray/10 no-print">
      <ScrollReveal>
        <h2 className="font-heading font-bold text-2xl text-chocolate mb-6">
          {label}
        </h2>
      </ScrollReveal>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map((r, i) => {
          const video = videoMap.get(r.videoId);
          const recipeTitle =
            locale === "es" ? r.es.title : r.en.title;
          return (
            <ScrollReveal key={r.videoId} delay={i * 0.1}>
              <RecipeCard
                videoId={r.videoId}
                thumbnailUrl={
                  video?.thumbnailUrl ||
                  `https://i.ytimg.com/vi/${r.videoId}/hqdefault.jpg`
                }
                title={recipeTitle}
                category={r.category}
                categoryLabel={tCat(r.category)}
                duration={video?.duration}
                viewCount={video?.viewCount}
                hasRecipe={true}
                prepTime={r.prepTime}
                cookTime={r.cookTime}
                difficulty={r.difficulty}
                servings={r.servings}
              />
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
