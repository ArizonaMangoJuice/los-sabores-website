import { MetadataRoute } from "next";
import { getAllVideos } from "@/lib/videos";
import { getAllRecipes } from "@/lib/recipes";

const BASE_URL = "https://saboresmitierra.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const videos = await getAllVideos();
  const recipes = await getAllRecipes();
  const recipeVideoIds = new Set(recipes.map((r) => r.videoId));

  const staticPages = [
    {
      url: `${BASE_URL}/es`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
      alternates: {
        languages: { es: `${BASE_URL}/es`, en: `${BASE_URL}/en` },
      },
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: {
        languages: { es: `${BASE_URL}/es`, en: `${BASE_URL}/en` },
      },
    },
    {
      url: `${BASE_URL}/es/recetas`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: {
        languages: {
          es: `${BASE_URL}/es/recetas`,
          en: `${BASE_URL}/en/recipes`,
        },
      },
    },
    {
      url: `${BASE_URL}/en/recipes`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          es: `${BASE_URL}/es/recetas`,
          en: `${BASE_URL}/en/recipes`,
        },
      },
    },
    {
      url: `${BASE_URL}/es/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: {
        languages: {
          es: `${BASE_URL}/es/sobre`,
          en: `${BASE_URL}/en/about`,
        },
      },
    },
    {
      url: `${BASE_URL}/en/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
      alternates: {
        languages: {
          es: `${BASE_URL}/es/sobre`,
          en: `${BASE_URL}/en/about`,
        },
      },
    },
  ];

  // Recipe detail pages with proper localized URLs and hreflang alternates
  const videoPages = videos.flatMap((video) => {
    const hasRecipe = recipeVideoIds.has(video.id);
    const alternates = {
      languages: {
        es: `${BASE_URL}/es/receta/${video.id}`,
        en: `${BASE_URL}/en/recipe/${video.id}`,
      },
    };
    return [
      {
        url: `${BASE_URL}/es/receta/${video.id}`,
        lastModified: new Date(video.publishedAt),
        changeFrequency: "monthly" as const,
        priority: hasRecipe ? 0.8 : 0.4,
        alternates,
      },
      {
        url: `${BASE_URL}/en/recipe/${video.id}`,
        lastModified: new Date(video.publishedAt),
        changeFrequency: "monthly" as const,
        priority: hasRecipe ? 0.7 : 0.3,
        alternates,
      },
    ];
  });

  return [...staticPages, ...videoPages];
}
