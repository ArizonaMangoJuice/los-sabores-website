import { Link } from "@/i18n/navigation";
import { Home, UtensilsCrossed, SearchX, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative blur circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-terracotta/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-corn-yellow/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-chile-red/5 rounded-full blur-3xl" />

      <div className="text-center relative z-10">
        {/* Icon illustration */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <UtensilsCrossed className="w-12 h-12 text-terracotta/40" />
          <SearchX className="w-16 h-16 text-terracotta" />
          <UtensilsCrossed className="w-12 h-12 text-terracotta/40 -scale-x-100" />
        </div>

        <h1 className="font-heading font-bold text-6xl md:text-7xl text-chocolate mb-3">
          404
        </h1>
        <p className="text-warm-gray text-lg mb-2">
          Esta receta no existe / This recipe doesn&apos;t exist
        </p>
        <p className="text-warm-gray/60 text-sm mb-10 max-w-sm mx-auto">
          La pagina que buscas no fue encontrada. Explora nuestras recetas.
          <br />
          The page you&apos;re looking for was not found. Explore our recipes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-cream rounded-full font-medium hover:bg-terracotta-light transition-colors shadow-lg shadow-terracotta/20"
          >
            <Home className="w-4 h-4" />
            Inicio / Home
          </Link>
          <Link
            href="/recetas"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-terracotta/30 text-terracotta rounded-full font-medium hover:bg-terracotta hover:text-cream transition-all"
          >
            <BookOpen className="w-4 h-4" />
            Recetas / Recipes
          </Link>
        </div>
      </div>
    </div>
  );
}
