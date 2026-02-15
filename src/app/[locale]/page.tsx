import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAllRecipes } from "@/lib/recipes";
import { getLatestVideos } from "@/lib/videos";
import HeroSection from "@/components/home/HeroSection";
import LatestVideos from "@/components/home/LatestVideos";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import SubscribeCTA from "@/components/home/SubscribeCTA";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const videos = await getLatestVideos(12);
  const recipes = await getAllRecipes();

  const latestVideo = videos[0];

  return (
    <>
      <HeroSection
        latestVideoId={latestVideo?.id}
        latestVideoTitle={latestVideo?.title}
      />
      {videos.length > 0 && (
        <LatestVideos
          videos={videos}
          recipes={recipes}
          locale={locale}
        />
      )}
      <CategoryShowcase />
      <SubscribeCTA />
    </>
  );
}
