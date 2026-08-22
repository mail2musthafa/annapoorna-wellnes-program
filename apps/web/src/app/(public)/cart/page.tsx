"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Tag,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const { cart, currency, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || !couponCode.trim()) return;
    setApplying(true);
    setCouponMsg(null);
    const err = await applyCoupon(couponCode);
    if (err) {
      setCouponMsg(err);
    } else {
      setCouponMsg("✓ 10% Discount applied successfully!");
      setCouponCode("");
    }
    setApplying(false);
  };

  const isCartEmpty = !cart || cart.items.length === 0;

  const formatPrice = (minor: number) => {
    return currency === "INR"
      ? `₹${(minor / 100).toLocaleString()}`
      : `$${(minor / 100).toFixed(2)}`;
  };

  return (
    <div className="py-16 sm:py-24 bg-[#faf8f5] text-sage-900 font-sans min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title */}
        <div className="border-b border-[#e5ddd3] pb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C35B32] bg-[#C35B32]/10 px-2.5 py-0.5 rounded-full">
              Shopping Cart & Registrations
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-sage-950 mt-1">
              Your Wellness Cart
            </h1>
            <p className="text-xs text-sage-600">Review your scheduled classes and selected health programs</p>
          </div>
          <Link href="/classes" className="text-xs font-bold text-[#C35B32] hover:underline">
            ← Explore More Classes
          </Link>
        </div>

        {isCartEmpty ? (
          <div className="bg-white rounded-3xl border border-[#e5ddd3] p-12 text-center space-y-4 shadow-xs">
            <ShoppingBag className="w-12 h-12 text-sand-400 mx-auto" />
            <h3 className="font-serif text-2xl font-bold text-sage-900">Your Cart is Empty</h3>
            <p className="text-xs text-sage-600 max-w-sm mx-auto">
              You haven't added any live masterclasses, nutrition packages, or programs yet.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/classes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C35B32] hover:bg-[#4d2aa6] text-white text-xs font-semibold shadow-xs transition-all"
              >
                Browse Live Classes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sand-100 hover:bg-sand-200 text-sage-800 text-xs font-semibold border border-sand-300 transition-all"
              >
                Explore Wellness Store
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#C35B32] transition-all"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#C35B32] bg-purple-50 px-2 py-0.5 rounded-full">
                      {item.product_type === "live_class" ? "Live Masterclass" : "Wellness Offering"}
                    </span>
                    <h3 className="font-serif text-base font-bold text-sage-950">{item.product_name}</h3>
                    <p className="text-xs text-sage-500 font-medium">
                      Unit Price: {formatPrice(item.unit_price_minor)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-sand-100">
                    <div className="flex items-center gap-2 bg-sand-100 px-3 py-1.5 rounded-full text-xs font-bold">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-sage-600 hover:text-sage-950 cursor-pointer"
                        title="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-sage-600 hover:text-sage-950 cursor-pointer"
                        title="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-base font-bold text-sage-950 block">
                        {formatPrice(item.total_minor)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-sage-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-6">
                <h3 className="font-serif text-lg font-bold text-sage-950 pb-3 border-b border-sand-200">
                  Order Summary
                </h3>

                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label className="text-[11px] font-bold text-sage-700 block">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. ANNAPOORNA10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 text-xs p-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                    />
                    <button
                      type="submit"
                      disabled={applying}
                      className="px-4 py-2.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-xs font-semibold text-sage-800 border border-sand-300 transition-all cursor-pointer"
                    >
                      {applying ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponMsg && (
                    <p className={`text-[11px] font-semibold ${couponMsg.startsWith("✓") ? "text-emerald-700" : "text-rose-600"}`}>
                      {couponMsg}
                    </p>
                  )}
                  {cart.coupon_code && (
                    <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-200">
                      <span>Applied: <strong>{cart.coupon_code}</strong> (-10%)</span>
                      <button onClick={removeCoupon} className="text-rose-600 font-bold hover:underline">
                        Remove
                      </button>
                    </div>
                  )}
                </form>

                {/* Calculation Rows */}
                <div className="space-y-2 text-xs text-sage-600 pt-3 border-t border-sand-200">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-sage-900">{formatPrice(cart.subtotal_minor)}</span>
                  </div>

                  {cart.discount_minor > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount (10%):</span>
                      <span>-{formatPrice(cart.discount_minor)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Estimated Tax / GST (9%):</span>
                    <span>{formatPrice(cart.tax_minor)}</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-sage-950 pt-3 border-t border-sand-200">
                    <span>Total:</span>
                    <span className="font-serif text-lg text-[#C35B32]">{formatPrice(cart.total_minor)}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full py-3.5 rounded-full bg-[#C35B32] hover:bg-[#4d2aa6] text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-sage-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-bit SSL Encrypted • Instant Access Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
