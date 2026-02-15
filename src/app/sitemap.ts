import { MetadataRoute } from "next";
import { getAllVideos } from "@/lib/videos";
import { getAllRecipes } from "@/lib/recipes";
import { CATEGORIES } from "@/lib/constants";

const BASE_URL = "https://saboresmitierra.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const videos = await getAllVideos();
  const recipes = await getAllRecipes();
  const recipeVideoIds = new Set(recipes.map((r) => r.videoId));

  const staticPages = [
    { url: `${BASE_URL}/es`, priority: 1.0 },
    { url: `${BASE_URL}/en`, priority: 0.9 },
    { url: `${BASE_URL}/es/recetas`, priority: 0.9 },
    { url: `${BASE_URL}/en/recetas`, priority: 0.8 },
    { url: `${BASE_URL}/es/sobre`, priority: 0.5 },
    { url: `${BASE_URL}/en/sobre`, priority: 0.4 },
  ].map((page) => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: page.priority,
  }));

  // Recipe detail pages (prioritize pages with full recipe data)
  const videoPages = videos.flatMap((video) => {
    const hasRecipe = recipeVideoIds.has(video.id);
    return [
      {
        url: `${BASE_URL}/es/receta/${video.id}`,
        lastModified: new Date(video.publishedAt),
        changeFrequency: "monthly" as const,
        priority: hasRecipe ? 0.8 : 0.4,
      },
      {
        url: `${BASE_URL}/en/receta/${video.id}`,
        lastModified: new Date(video.publishedAt),
        changeFrequency: "monthly" as const,
        priority: hasRecipe ? 0.7 : 0.3,
      },
    ];
  });

  return [...staticPages, ...videoPages];
}
