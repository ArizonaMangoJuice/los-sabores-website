import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAllRecipes } from "@/lib/recipes";
import { getAllVideos } from "@/lib/videos";
import RecipeGrid from "@/components/recipes/RecipeGrid";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Recipes" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: `${t("title")} | ${tMeta("title")}`,
    description: tMeta("description"),
  };
}

export default async function RecipesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Recipes" });

  const detailedVideos = await getAllVideos();
  const recipes = await getAllRecipes();

  return (
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
  );
}
