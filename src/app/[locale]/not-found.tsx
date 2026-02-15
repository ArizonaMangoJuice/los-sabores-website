import { Link } from "@/i18n/navigation";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl mb-4">🍽️</p>
        <h1 className="font-heading font-bold text-4xl text-chocolate mb-2">
          404
        </h1>
        <p className="text-warm-gray text-lg mb-8">
          Esta receta no existe / This recipe doesn&apos;t exist
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-cream rounded-full font-medium hover:bg-terracotta-light transition-colors"
        >
          <Home className="w-4 h-4" />
          Inicio / Home
        </Link>
      </div>
    </div>
  );
}
