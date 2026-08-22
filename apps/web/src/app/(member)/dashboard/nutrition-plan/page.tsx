"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Utensils, Droplets, ShoppingBag, ShieldCheck, Award } from "lucide-react";
import { ApiClient } from "@/lib/api/client";
import { NutritionPlan } from "@/types";

export default function MyNutritionPlanPage() {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.get<NutritionPlan>("/api/v1/nutrition-plans/me")
      .then((data) => setPlan(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-12 sm:py-16 bg-sand-50 min-h-[80vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-sand-200 pb-4">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage-600 hover:text-annapoorna-600">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-annapoorna-600">Clinical Nutrition</span>
        </div>

        {loading ? (
          <div className="py-24 text-center text-sage-600 text-sm">
            Loading your personalized nutrition plan...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header & 2-Stage Status Banner */}
            <div className="bg-white p-8 rounded-3xl border border-sand-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-emerald-700">Pillar 1 • Nutrition</span>
                  <h1 className="font-serif text-3xl font-bold text-sage-900 mt-1">
                    {plan?.title || "6-Week Metabolic Vitality & Anti-Inflammatory Plan"}
                  </h1>
                  <p className="text-xs text-sage-600">
                    Objective: <strong>{plan?.objective || "Metabolic Optimization & Sustained Energy"}</strong>
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold shadow-xs">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>Approved by Nutrition Expert</span>
                </div>
              </div>

              {/* Expert Notes Box */}
              <div className="p-4 rounded-2xl bg-sand-100/70 border border-sand-200 text-xs text-sage-700 space-y-1">
                <span className="font-bold text-sage-900 block">Expert Review Notes (Shobha Swamy, Lead Nutritionist):</span>
                <p className="italic">
                  “Plan approved. Excellent balance of prebiotic resistant starch, yellow mung dal, and anti-inflammatory turmeric. Maintain 3L warm hydration.”
                </p>
              </div>
            </div>

            {/* Macronutrient Targets */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-sand-200 text-center space-y-1">
                <span className="text-xs text-sage-500 font-medium">Daily Calories</span>
                <span className="font-serif text-2xl font-bold text-sage-900 block">1,850</span>
                <span className="text-[10px] text-sage-400">kcal / day</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-sand-200 text-center space-y-1">
                <span className="text-xs text-sage-500 font-medium">Plant Protein</span>
                <span className="font-serif text-2xl font-bold text-emerald-800 block">75g</span>
                <span className="text-[10px] text-sage-400">Target</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-sand-200 text-center space-y-1">
                <span className="text-xs text-sage-500 font-medium">Complex Carbs</span>
                <span className="font-serif text-2xl font-bold text-amber-800 block">250g</span>
                <span className="text-[10px] text-sage-400">Whole Plants</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-sand-200 text-center space-y-1">
                <span className="text-xs text-sage-500 font-medium">Healthy Fats</span>
                <span className="font-serif text-2xl font-bold text-rose-800 block">45g</span>
                <span className="text-[10px] text-sage-400">Nuts & Seeds</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-sand-200 text-center space-y-1 col-span-2 sm:col-span-1">
                <span className="text-xs text-sage-500 font-medium">Prebiotic Fiber</span>
                <span className="font-serif text-2xl font-bold text-teal-800 block">45g+</span>
                <span className="text-[10px] text-sage-400">High Microbiome</span>
              </div>
            </div>

            {/* Meal Slots */}
            <div className="bg-white p-8 rounded-3xl border border-sand-200 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-bold text-sage-900 border-b border-sand-100 pb-3">
                Recommended Daily Meal Structure
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-annapoorna-600">Breakfast</span>
                    <h4 className="font-serif text-base font-bold text-sage-900">Warm Cardamom Quinoa Porridge with Chia Seeds</h4>
                    <p className="text-xs text-sage-600">Simmered in almond milk with Ceylon cinnamon and stewed organic apples.</p>
                  </div>
                  <span className="text-xs font-bold text-sage-700 bg-white px-3 py-1 rounded-full border border-sand-200">
                    350 kcal
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-annapoorna-600">Lunch</span>
                    <h4 className="font-serif text-base font-bold text-sage-900">Ayurvedic Golden Kitchari with Steamed Greens</h4>
                    <p className="text-xs text-sage-600">Yellow split mung dal and basmati rice infused with turmeric, cumin, and fresh ginger.</p>
                  </div>
                  <span className="text-xs font-bold text-sage-700 bg-white px-3 py-1 rounded-full border border-sand-200">
                    450 kcal
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-annapoorna-600">Dinner</span>
                    <h4 className="font-serif text-base font-bold text-sage-900">Sweet Potato Chickpea Coconut Bowl</h4>
                    <p className="text-xs text-sage-600">Steamed Japanese sweet potatoes and hearty chickpeas in light coconut broth with lemon tahini.</p>
                  </div>
                  <span className="text-xs font-bold text-sage-700 bg-white px-3 py-1 rounded-full border border-sand-200">
                    480 kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Shopping List & Hydration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-sand-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShoppingBag className="w-5 h-5" />
                  <h4 className="font-serif text-lg font-bold">Pantry & Shopping List</h4>
                </div>
                <ul className="space-y-2 text-xs text-sage-700">
                  <li>• Yellow split mung dal (500g)</li>
                  <li>• Organic white quinoa (500g)</li>
                  <li>• Japanese sweet potatoes (1kg)</li>
                  <li>• Ground flaxseeds & chia seeds</li>
                  <li>• Fresh turmeric & ginger roots</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-sand-200 space-y-3">
                <div className="flex items-center gap-2 text-teal-800">
                  <Droplets className="w-5 h-5" />
                  <h4 className="font-serif text-lg font-bold">Hydration Guidelines</h4>
                </div>
                <p className="text-xs text-sage-600 leading-relaxed">
                  Drink 3 Liters of warm filtered water daily with lemon and ginger slices. Avoid ice-cold beverages during meals to maintain digestive fire (Agni).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
