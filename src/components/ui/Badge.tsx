import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  sopas: "bg-amber-100 text-amber-800",
  antojitos: "bg-orange-100 text-orange-800",
  postres: "bg-pink-100 text-pink-800",
  bebidas: "bg-purple-100 text-purple-800",
  carnes: "bg-red-100 text-red-800",
  mariscos: "bg-cyan-100 text-cyan-800",
  salsas: "bg-rose-100 text-rose-800",
  pan: "bg-yellow-100 text-yellow-800",
  ensaladas: "bg-green-100 text-green-800",
  "platillo-fuerte": "bg-stone-100 text-stone-800",
  desayunos: "bg-sky-100 text-sky-800",
};

interface BadgeProps {
  category: string;
  label?: string;
  className?: string;
}

export default function Badge({ category, label, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide",
        categoryColors[category] || "bg-gray-100 text-gray-800",
        className,
      )}
    >
      {label || category}
    </span>
  );
}
