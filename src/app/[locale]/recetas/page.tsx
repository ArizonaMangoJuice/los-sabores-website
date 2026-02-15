import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAllRecipes } from "@/lib/recipes";
import { getAllVideos } from "@/lib/videos";
import RecipeGrid from "@/components/recipes/RecipeGrid";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Recipes" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  const title = `${t("title")} | ${tMeta("title")}`;
  const description = tMeta("description");
  const esPath = "/es/recetas";
  const enPath = "/en/recipes";
  const currentPath = locale === "es" ? esPath : enPath;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "es" ? "es_MX" : "en_US",
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

export default async function RecipesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Recipes" });

  const detailedVideos = await getAllVideos();
  const recipes = await getAllRecipes();

  // ItemList JSON-LD for recipe collection
  const recipeVideos = detailedVideos.filter((v) =>
    recipes.some((r) => r.videoId === v.id)
  );
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: locale === "es" ? "Recetas de Cocina" : "Cooking Recipes",
    description:
      locale === "es"
        ? "Coleccion de recetas tradicionales latinoamericanas"
        : "Collection of traditional Latin American recipes",
    numberOfItems: recipeVideos.length,
    itemListElement: recipeVideos.slice(0, 30).map((video, i) => {
      const recipe = recipes.find((r) => r.videoId === video.id);
      const recipeTitle =
        recipe?.[locale as "es" | "en"]?.title ?? video.title;
      const recipePath =
        locale === "es"
          ? `/es/receta/${video.id}`
          : `/en/recipe/${video.id}`;
      return {
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}${recipePath}`,
        name: recipeTitle,
      };
    }),
  };

  // BreadcrumbList JSON-LD
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
        name: locale === "es" ? "Recetas" : "Recipes",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-10">
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-chocolate">
                {t("title")}
              </h1>
              <div className="w-16 h-1 bg-terracotta mt-3 rounded-full" />
            </div>
          </ScrollReveal>

          <RecipeGrid videos={detailedVideos} recipes={recipes} />
        </div>
      </div>
    </>
  );
}
