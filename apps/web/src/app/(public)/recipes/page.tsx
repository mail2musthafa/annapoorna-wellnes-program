import Link from "next/link";
import { Utensils, Clock, Flame, Tag, ArrowRight } from "lucide-react";

export default function RecipesCataloguePage() {
  const sampleRecipes = [
    {
      title: "Ayurvedic Golden Kitchari with Spiced Greens",
      slug: "ayurvedic-golden-kitchari",
      summary: "A gentle, deeply nourishing one-pot stew made of yellow split mung dal and basmati rice infused with turmeric, cumin, and ginger.",
      prepTime: "15 min",
      cookTime: "30 min",
      calories: "340 kcal",
      tags: ["Gluten-Free", "High-Fiber", "Anti-Inflammatory"],
      difficulty: "Easy",
    },
    {
      title: "Raw Rainbow Crunch Salad with Creamy Tahini-Ginger Dressing",
      slug: "raw-rainbow-crunch-salad",
      summary: "Crisp purple cabbage, shredded carrots, edamame, and toasted sesame seeds tossed with a zesty lemon-tahini vinaigrette.",
      prepTime: "20 min",
      cookTime: "0 min",
      calories: "290 kcal",
      tags: ["Raw", "Vegan", "Prebiotic", "Gut-Health"],
      difficulty: "Easy",
    },
    {
      title: "Steamed Sweet Potato & Coconut Chickpea Curry",
      slug: "sweet-potato-chickpea-curry",
      summary: "Hearty chickpeas simmered with Japanese sweet potatoes, mustard seeds, and creamy coconut milk.",
      prepTime: "15 min",
      cookTime: "25 min",
      calories: "380 kcal",
      tags: ["High-Protein", "Plant-Based", "Comfort"],
      difficulty: "Medium",
    },
  ];

  return (
    <div className="py-16 sm:py-24 bg-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-annapoorna-600">Culinary Medicine</span>
          <h1 className="font-serif text-4xl font-bold text-sage-900">
            Nourishing Whole-Food Recipes
          </h1>
          <p className="text-sm text-sage-600">
            Every dish is formulated with clean anti-inflammatory plants, precise portions, and evidence-informed nutritional values.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleRecipes.map((recipe, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-sand-200 p-6 flex flex-col justify-between hover:shadow-md transition-all space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-sage-500">
                  <span className="px-3 py-1 bg-sand-100 rounded-full font-semibold">{recipe.difficulty}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {recipe.prepTime} + {recipe.cookTime}</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-sage-900 leading-snug">
                  {recipe.title}
                </h3>
                <p className="text-xs text-sage-600 leading-relaxed line-clamp-3">
                  {recipe.summary}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {recipe.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] font-semibold px-2.5 py-0.5 bg-sage-50 text-sage-700 border border-sage-200 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-sand-100 flex items-center justify-between">
                <span className="text-xs font-bold text-sage-700">{recipe.calories}</span>
                <span className="text-xs font-bold text-annapoorna-600 flex items-center gap-1">
                  View Recipe <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
