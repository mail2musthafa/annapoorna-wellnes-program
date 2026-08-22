"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Users, Calendar, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, currency } = useCart();
  const [adding, setAdding] = useState(false);

  // Find price for active currency
  const priceObj = product.prices.find((p) => p.currency === currency) || product.prices[0];
  const priceMinor = priceObj?.amount_minor || 2500;
  const compareAtMinor = priceObj?.compare_at_minor;

  const isLiveClass = product.product_type === "single_class" || product.product_type === "workshop";

  const formatPrice = (minor: number) => {
    if (currency === "INR") {
      return `₹${(minor / 100).toLocaleString()}`;
    }
    return `$${(minor / 100).toFixed(2)}`;
  };

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLiveClass) {
      router.push(`/classes`);
      return;
    }

    setAdding(true);
    try {
      await addToCart({
        product_id: product.id,
        product_name: product.name,
        product_type: product.product_type,
        quantity: 1,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-sand-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Product Image Cover Banner */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-sand-200">
        <img
          src={
            product.image_url ||
            "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-sage-900 shadow-xs">
            {product.product_type.replace(/_/g, " ")}
          </span>
          {product.pillar_tag && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-900/80 backdrop-blur-md text-emerald-100 border border-emerald-500/30 shadow-xs">
              {product.pillar_tag}
            </span>
          )}
        </div>

        {/* Bottom Floating Rating on Image */}
        {product.rating && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{product.rating}</span>
            <span className="text-white/70 font-normal">({product.review_count})</span>
          </div>
        )}
      </div>

      {/* Media & Details Body */}
      <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-lg font-bold text-sage-900 group-hover:text-annapoorna-600 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
          {product.instructor_name && (
            <p className="text-xs text-sage-500">
              Faculty: <strong>{product.instructor_name}</strong>
            </p>
          )}
          <p className="text-xs text-sage-600 leading-relaxed line-clamp-2">
            {product.short_description}
          </p>
        </div>

        {product.capacity && (
          <div className="flex items-center gap-1.5 text-xs text-sage-500 pt-1">
            <Users className="w-3.5 h-3.5 text-annapoorna-600" />
            <span>{product.capacity} seats max cohort</span>
          </div>
        )}
      </div>

      {/* Pricing & CTA Buttons Footer */}
      <div className="p-6 pt-0 space-y-3">
        <div className="flex items-baseline justify-between pt-3 border-t border-sand-100">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-sage-900">
              {formatPrice(priceMinor)}
            </span>
            {compareAtMinor && (
              <span className="text-xs text-sage-400 line-through">
                {formatPrice(compareAtMinor)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-sage-400 font-medium uppercase tracking-wider">
            {currency} Authoritative
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 py-2.5 rounded-full bg-sand-100 hover:bg-sand-200 text-sage-800 text-xs font-semibold text-center transition-all"
          >
            Details
          </Link>
          <button
            disabled={adding}
            onClick={handleAction}
            className="flex-1 py-2.5 rounded-full bg-annapoorna-600 hover:bg-annapoorna-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {adding ? (
              "Adding..."
            ) : isLiveClass ? (
              <>
                <Calendar className="w-3.5 h-3.5" /> Select Date
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
