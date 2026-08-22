"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  Calendar,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Download,
  Award,
  AlertCircle,
} from "lucide-react";
import { ApiClient } from "@/lib/api/client";
import { useCart } from "@/context/CartContext";
import { ClassSession, Product } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addToCart, currency } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    Promise.all([
      ApiClient.get<Product>(`/api/v1/products/${slug}`),
      ApiClient.get<ClassSession[]>("/api/v1/calendar/sessions"),
    ])
      .then(([prodData, sessData]) => {
        setProduct(prodData);
        // Filter sessions relevant to this product
        const matched = sessData.filter((s) => s.product_id === prodData.id || s.slug.includes(slug.replace("-class", "")));
        setSessions(matched.length > 0 ? matched : sessData.slice(0, 3));
        if (matched.length > 0) {
          setSelectedSessionId(matched[0].id);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load product details.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center text-sage-600 text-sm font-medium">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-sage-800">Product Not Found</h2>
        <Link href="/products" className="text-xs font-bold text-annapoorna-600 underline">
          ← Back to All Products
        </Link>
      </div>
    );
  }

  const isLiveClass = product.product_type === "single_class" || product.product_type === "workshop";
  const isConsultation = product.product_type === "consultation" || product.product_type === "coaching_package";

  const priceObj = product.prices.find((p) => p.currency === currency) || product.prices[0];
  const priceMinor = priceObj?.amount_minor || 2500;
  const compareAtMinor = priceObj?.compare_at_minor;

  const formatPrice = (minor: number) => {
    if (currency === "INR") {
      return `₹${(minor / 100).toLocaleString()}`;
    }
    return `$${(minor / 100).toFixed(2)}`;
  };

  const handleAddToCart = async () => {
    if ((isLiveClass || isConsultation) && !selectedSessionId) {
      setError("Please select a date and time slot first.");
      return;
    }

    setAdding(true);
    setError(null);
    try {
      let seatHoldId = undefined;
      let selectedSession = undefined;

      if (isLiveClass && selectedSessionId) {
        // Create 15-min seat hold
        const guestToken = typeof window !== "undefined" ? localStorage.getItem("annapoorna_guest_token") || "guest-123" : "guest-123";
        const holdRes = await ApiClient.post<{ seat_hold_id: string }>("/api/v1/calendar/hold-seat", {
          session_id: selectedSessionId,
          seats: 1,
          guest_token: guestToken,
        });
        seatHoldId = holdRes.seat_hold_id;
        selectedSession = sessions.find((s) => s.id === selectedSessionId);
      }

      await addToCart({
        product_id: product.id,
        product_name: product.name,
        product_type: product.product_type,
        session_id: selectedSessionId || undefined,
        seat_hold_id: seatHoldId,
        quantity: isLiveClass ? 1 : quantity,
        variation_meta: selectedSession
          ? {
              session_title: selectedSession.title,
              instructor_name: selectedSession.instructor_name || product.instructor_name,
              start_time: selectedSession.start_time,
              timezone: selectedSession.iana_timezone,
            }
          : undefined,
      });
    } catch (err: any) {
      setError(err.message || "Could not reserve item. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    setBuyingNow(true);
    await handleAddToCart();
    router.push("/cart");
  };

  return (
    <div className="py-12 sm:py-20 bg-sand-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-sage-500 font-medium">
          <Link href="/products" className="hover:text-annapoorna-600">Store</Link>
          <span>/</span>
          <span className="capitalize">{product.product_type.replace(/_/g, " ")}</span>
          <span>/</span>
          <span className="text-sage-900 font-semibold">{product.name}</span>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </div>
        )}

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Main Overview (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-3xl border border-sand-200 shadow-sm overflow-hidden space-y-6">
              {product.image_url && (
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-sand-200">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              )}

              <div className="p-8 sm:p-10 pt-0 space-y-6">
                <div className="flex items-center justify-between pt-4">
                  <span className="text-xs uppercase font-bold tracking-widest text-annapoorna-700 bg-sand-100 px-3 py-1 rounded-full">
                    {product.product_type.replace(/_/g, " ")}
                  </span>
                  {product.pillar_tag && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Pillar: {product.pillar_tag}
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-sage-900 leading-tight">
                  {product.name}
                </h1>

                {product.rating && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      <span>{product.rating}</span>
                    </div>
                    <span className="text-sage-400">•</span>
                    <span className="text-sage-600 font-medium">{product.review_count} verified reviews</span>
                  </div>
                )}

                <p className="text-sm text-sage-700 leading-relaxed font-light">
                  {product.full_description || product.short_description}
                </p>

                {/* Instructor Bio Card */}
                {product.instructor_name && (
                  <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-annapoorna-500 text-white font-serif font-bold text-lg flex items-center justify-center">
                      {product.instructor_name[0]}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-annapoorna-700">Course Leader</span>
                      <h4 className="font-serif text-base font-bold text-sage-900">{product.instructor_name}</h4>
                      <p className="text-xs text-sage-500">{product.instructor_title || "Lead Holistic Medicine Specialist"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Outcomes & What's Included */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-sand-200 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-bold text-sage-900 border-b border-sand-100 pb-3">
                Learning Outcomes & Benefits
              </h3>
              <ul className="space-y-3 text-xs text-sage-700">
                {(product.learning_outcomes && product.learning_outcomes.length > 0
                  ? product.learning_outcomes
                  : [
                      "Master whole food, plant-predominant metabolic nutrition fundamentals",
                      "Cook anti-inflammatory meals with zero refined oils",
                      "Incorporate evidence-based habit anchors for long-term health",
                      "Live interaction and personalized feedback during sessions",
                    ]
                ).map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Purchase Action Box (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-sand-200 shadow-md space-y-6 sticky top-28">
              {/* Pricing Display */}
              <div className="border-b border-sand-100 pb-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-sage-900">
                    {formatPrice(priceMinor)}
                  </span>
                  {compareAtMinor && (
                    <span className="text-sm text-sage-400 line-through">
                      {formatPrice(compareAtMinor)}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-sage-500 mt-1 block font-medium">
                  {currency} • Includes all course materials and lifetime updates
                </span>
              </div>

              {/* Session Selector (for Live Classes & Workshops) */}
              {isLiveClass && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-sage-900">
                    Select Available Class Date & Time:
                  </label>
                  <div className="space-y-2">
                    {sessions.map((sess) => {
                      const dt = new Date(sess.start_time);
                      const isSelected = selectedSessionId === sess.id;
                      return (
                        <div
                          key={sess.id}
                          onClick={() => setSelectedSessionId(sess.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                            isSelected
                              ? "border-annapoorna-600 bg-annapoorna-50/60 font-bold text-annapoorna-950 shadow-xs"
                              : "border-sand-200 hover:bg-sand-50 text-sage-700"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <p className="font-semibold">{sess.title}</p>
                            <p className="text-[11px] text-sage-500">
                              📅 {dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at{" "}
                              {dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sess.available_seats <= 5
                                ? "bg-amber-100 text-amber-900"
                                : "bg-emerald-100 text-emerald-900"
                            }`}
                          >
                            {sess.available_seats} Left
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity selector for non-classes */}
              {!isLiveClass && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-sage-700">Quantity:</span>
                  <div className="flex items-center border border-sand-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 hover:bg-sand-100 text-sage-800 font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-semibold text-sage-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="px-3 py-1 hover:bg-sand-100 text-sage-800 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  disabled={adding || buyingNow}
                  onClick={handleAddToCart}
                  className="w-full py-3.5 rounded-full bg-annapoorna-600 hover:bg-annapoorna-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {adding ? (
                    "Reserving..."
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  disabled={adding || buyingNow}
                  onClick={handleBuyNow}
                  className="w-full py-3.5 rounded-full bg-sage-800 hover:bg-sage-900 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {buyingNow ? "Redirecting..." : "Instant Buy Now"}
                </button>
              </div>

              {/* Security & Refund Guarantees */}
              <div className="space-y-2 pt-4 border-t border-sand-100 text-[11px] text-sage-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{product.refund_policy_days || 30}-Day Satisfaction Refund Policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-annapoorna-600 shrink-0" />
                  <span>Verified Medical & Culinary Faculty Certification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
