import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  pathnames: {
    "/": "/",
    "/recetas": {
      es: "/recetas",
      en: "/recipes",
    },
    "/receta/[videoId]": {
      es: "/receta/[videoId]",
      en: "/recipe/[videoId]",
    },
    "/sobre": {
      es: "/sobre",
      en: "/about",
    },
    "/privacidad": {
      es: "/privacidad",
      en: "/privacy",
    },
  },
});

export type Pathnames = keyof typeof routing.pathnames;
