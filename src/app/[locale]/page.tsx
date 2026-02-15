import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAllRecipes } from "@/lib/recipes";
import { getLatestVideos } from "@/lib/videos";
import HeroSection from "@/components/home/HeroSection";
import LatestVideos from "@/components/home/LatestVideos";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import SubscribeCTA from "@/components/home/SubscribeCTA";
import AdUnit from "@/components/ads/AdUnit";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: SITE_NAME,
      locale: locale === "es" ? "es_MX" : "en_US",
      alternateLocale: locale === "es" ? "en_US" : "es_MX",
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        es: `${SITE_URL}/es`,
        en: `${SITE_URL}/en`,
      },
    },
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
      {/* Ad between sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <AdUnit
          slot={process.env.NEXT_PUBLIC_AD_SLOT_BANNER || ""}
          format="horizontal"
          className="rounded-xl"
        />
      </div>

      <CategoryShowcase
        recipeCounts={recipes.reduce(
          (acc, r) => {
            acc[r.category] = (acc[r.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        )}
      />
      <SubscribeCTA />
    </>
  );
}
