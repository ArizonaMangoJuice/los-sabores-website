export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelTitle: string;
}

export interface VideoDetails extends YouTubeVideo {
  duration: string;
  viewCount: string;
  likeCount: string;
}

export interface ChannelInfo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: string;
  videoCount: string;
  bannerUrl?: string;
}

export type RecipeCategory =
  | "sopas"
  | "antojitos"
  | "postres"
  | "bebidas"
  | "carnes"
  | "mariscos"
  | "salsas"
  | "pan"
  | "ensaladas"
  | "platillo-fuerte"
  | "desayunos";

export interface IngredientGroup {
  group?: string;
  items: string[];
}

export interface RecipeLocaleData {
  title: string;
  description: string;
  ingredients: IngredientGroup[];
  steps: string[];
  tips?: string[];
}

export interface Recipe {
  videoId: string;
  slug: string;
  category: RecipeCategory;
  tags: string[];
  featured: boolean;
  difficulty: "easy" | "medium" | "hard";
  prepTime: number;
  cookTime: number;
  servings: number;
  es: RecipeLocaleData;
  en: RecipeLocaleData;
}

export interface VideoWithRecipe extends VideoDetails {
  recipe: Recipe | null;
}
