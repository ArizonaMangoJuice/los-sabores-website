"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Recipe } from "@/types";
import { Clock, Users, ChefHat, Printer, Lightbulb } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface RecipeDetailsProps {
  recipe: Recipe;
  locale: string;
}

export default function RecipeDetails({ recipe, locale }: RecipeDetailsProps) {
  const t = useTranslations("Recipes");
  const tDiff = useTranslations("Difficulty");
  const localeData = locale === "es" ? recipe.es : recipe.en;
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set(),
  );

  function toggleIngredient(item: string) {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-8">
      {/* Meta badges */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-linen rounded-xl px-4 py-2">
          <Clock className="w-4 h-4 text-terracotta" />
          <div>
            <p className="text-xs text-warm-gray">{t("prepTime")}</p>
            <p className="text-sm font-semibold">
              {formatTime(recipe.prepTime, locale)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-linen rounded-xl px-4 py-2">
          <Clock className="w-4 h-4 text-chile-red" />
          <div>
            <p className="text-xs text-warm-gray">{t("cookTime")}</p>
            <p className="text-sm font-semibold">
              {formatTime(recipe.cookTime, locale)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-linen rounded-xl px-4 py-2">
          <Users className="w-4 h-4 text-avocado" />
          <div>
            <p className="text-xs text-warm-gray">{t("servings")}</p>
            <p className="text-sm font-semibold">{recipe.servings}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-linen rounded-xl px-4 py-2">
          <ChefHat className="w-4 h-4 text-corn-yellow" />
          <div>
            <p className="text-xs text-warm-gray">{t("difficulty")}</p>
            <p
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColors[recipe.difficulty]}`}
            >
              {tDiff(recipe.difficulty)}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-warm-gray/10" />

      {/* Print button */}
      <button
        onClick={() => window.print()}
        className="no-print flex items-center gap-2 px-5 py-2.5 border-2 border-terracotta/30 text-terracotta rounded-xl hover:bg-terracotta hover:text-white transition-all text-sm font-medium"
      >
        <Printer className="w-4 h-4" />
        {t("print")}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Ingredients */}
        <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
          <h3 className="font-heading font-bold text-xl mb-4 text-chocolate">
            {t("ingredients")}
          </h3>
          <div className="bg-linen rounded-2xl p-6 space-y-4">
            {localeData.ingredients.map((group, gi) => (
              <div key={gi}>
                {group.group && (
                  <h4 className="font-semibold text-sm text-terracotta mb-2 uppercase tracking-wide">
                    {group.group}
                  </h4>
                )}
                <ul className="space-y-2">
                  {group.items.map((item, ii) => (
                    <li key={ii}>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checkedIngredients.has(`${gi}-${ii}`)}
                          onChange={() => toggleIngredient(`${gi}-${ii}`)}
                          className="mt-1 accent-terracotta"
                        />
                        <span
                          className={`text-sm transition-all ${
                            checkedIngredients.has(`${gi}-${ii}`)
                              ? "line-through text-warm-gray"
                              : "text-chocolate"
                          }`}
                        >
                          {item}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="lg:col-span-3">
          <h3 className="font-heading font-bold text-xl mb-4 text-chocolate">
            {t("steps")}
          </h3>
          <ol className="space-y-4">
            {localeData.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <div className={`flex-shrink-0 ${i + 1 > 9 ? "w-9 h-9" : "w-8 h-8"} bg-terracotta text-white rounded-full flex items-center justify-center font-bold text-sm`}>
                  {i + 1}
                </div>
                <p className="text-sm text-chocolate/90 pt-1 leading-relaxed">
                  {step}
                </p>
              </li>
            ))}
          </ol>

          {/* Tips */}
          {localeData.tips && localeData.tips.length > 0 && (
            <div className="mt-8 bg-corn-yellow/10 border border-corn-yellow/30 rounded-2xl p-6">
              <h4 className="font-heading font-bold text-lg mb-3 flex items-center gap-2 text-chocolate">
                <Lightbulb className="w-5 h-5 text-corn-yellow" />
                {t("tips")}
              </h4>
              <ul className="space-y-2">
                {localeData.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="text-sm text-chocolate/80 flex items-start gap-2"
                  >
                    <span className="text-corn-yellow mt-0.5">&#x2022;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
