"use client";

import React, { useEffect, useState } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { ApiClient } from "@/lib/api/client";
import { Product } from "@/types";
import { Sparkles, Filter } from "lucide-react";

export default function ProductsCataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiClient.get<Product[]>("/api/v1/products")
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { label: "All Offerings", value: "all" },
    { label: "Live Cooking & Workshops", value: "single_class" },
    { label: "Multi-Week Programs", value: "program" },
    { label: "1-on-1 Consultations", value: "consultation" },
    { label: "Coaching Packages", value: "coaching_package" },
    { label: "Self-Paced Courses", value: "course" },
    { label: "Meal Plans & Bundles", value: "meal_plan_package" },
    { label: "Downloadable Guides", value: "downloadable_guide" },
    { label: "Memberships", value: "membership_monthly" },
  ];

  const filteredProducts = products.filter((p) => {
    if (category === "all") return true;
    if (category === "single_class") return p.product_type === "single_class" || p.product_type === "workshop";
    if (category === "membership_monthly") return p.product_type === "membership_monthly" || p.product_type === "membership_annual";
    return p.product_type === category;
  });

  return (
    <div className="py-16 sm:py-24 bg-sand-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-annapoorna-600">
            Holistic Education & Wellness Store
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-sage-900">
            Explore Programs, Classes & Resources
          </h1>
          <p className="text-sm text-sage-600 leading-relaxed font-light">
            Choose from live cooking masterclasses, physician-designed cohort programs, clinical nutrition meal plans, and all-access memberships.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="p-2 bg-white rounded-2xl border border-sand-200 shadow-xs flex flex-wrap items-center justify-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                category === c.value
                  ? "bg-annapoorna-600 text-white shadow-xs"
                  : "bg-transparent text-sage-700 hover:bg-sand-100"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-24 text-center text-sage-600 text-sm font-medium">
            Loading Annapoorna catalogue...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-sand-200 p-8 space-y-2">
            <p className="text-sm text-sage-700">No products found in this category.</p>
            <button onClick={() => setCategory("all")} className="text-xs font-bold text-annapoorna-600 underline">
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
