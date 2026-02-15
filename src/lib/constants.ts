export const SITE_NAME = "Los Sabores de Mi Tierra";
export const SITE_URL = "https://saboresmitierra.com";

export const YOUTUBE_CHANNEL_URL =
  "https://www.youtube.com/@lossaboresdemitierra8378";

export const SOCIAL_LINKS = {
  youtube: YOUTUBE_CHANNEL_URL,
};

export const CATEGORIES = [
  "sopas",
  "antojitos",
  "postres",
  "bebidas",
  "carnes",
  "mariscos",
  "salsas",
  "pan",
  "ensaladas",
  "platillo-fuerte",
  "desayunos",
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  sopas: "Soup",
  antojitos: "UtensilsCrossed",
  postres: "Cake",
  bebidas: "Wine",
  carnes: "Beef",
  mariscos: "Fish",
  salsas: "Flame",
  pan: "Croissant",
  ensaladas: "Salad",
  "platillo-fuerte": "ChefHat",
  desayunos: "Egg",
};
