import fs from "fs/promises";
import path from "path";
import { Recipe } from "@/types";

const RECIPES_DIR = path.join(process.cwd(), "content", "recipes");

export async function getAllRecipes(): Promise<Recipe[]> {
  try {
    const files = await fs.readdir(RECIPES_DIR);
    const recipes = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          const content = await fs.readFile(
            path.join(RECIPES_DIR, f),
            "utf-8",
          );
          return JSON.parse(content) as Recipe;
        }),
    );
    return recipes;
  } catch {
    return [];
  }
}

export async function getRecipeByVideoId(
  videoId: string,
): Promise<Recipe | null> {
  try {
    const filePath = path.join(RECIPES_DIR, `${videoId}.json`);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as Recipe;
  } catch {
    return null;
  }
}

export async function getFeaturedRecipes(): Promise<Recipe[]> {
  const all = await getAllRecipes();
  return all.filter((r) => r.featured);
}

export async function getRecipesByCategory(
  category: string,
): Promise<Recipe[]> {
  const all = await getAllRecipes();
  return all.filter((r) => r.category === category);
}
