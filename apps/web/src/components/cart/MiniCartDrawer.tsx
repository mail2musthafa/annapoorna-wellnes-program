"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, Trash2, Clock, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function MiniCartDrawer() {
  const router = useRouter();
  const { cart, isDrawerOpen, setIsDrawerOpen, removeItem, updateQuantity, currency } = useCart();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Seat Hold Countdown calculation
  useEffect(() => {
    if (!cart || !cart.items.length) {
      setSecondsLeft(null);
      return;
    }

    const itemWithHold = cart.items.find((i) => i.seat_hold_seconds_remaining !== null && i.seat_hold_seconds_remaining !== undefined);
    if (itemWithHold && itemWithHold.seat_hold_seconds_remaining) {
      setSecondsLeft(itemWithHold.seat_hold_seconds_remaining);
    }
  }, [cart]);

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  if (!isDrawerOpen) return null;

  const formatPrice = (minor: number) => {
    if (currency === "INR") {
      return `₹${(minor / 100).toLocaleString()}`;
    }
    return `$${(minor / 100).toFixed(2)}`;
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-sage-950/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-sand-200">
          {/* Header */}
          <div className="p-6 border-b border-sand-200 flex items-center justify-between bg-sand-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-annapoorna-600" />
              <h2 className="font-serif text-xl font-bold text-sage-900">Your Wellness Cart</h2>
              {cart && cart.item_count > 0 && (
                <span className="text-xs bg-annapoorna-100 text-annapoorna-800 font-bold px-2 py-0.5 rounded-full">
                  {cart.item_count}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-full text-sage-600 hover:bg-sand-200 hover:text-sage-900 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Seat Hold Warning Banner */}
          {secondsLeft !== null && secondsLeft > 0 && (
            <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900 font-semibold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                Seat Reserved For:
              </span>
              <span className="font-mono text-sm font-bold bg-amber-200/80 px-2 py-0.5 rounded-md text-amber-950">
                {formatTime(secondsLeft)}
              </span>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!cart || cart.items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-sand-100 flex items-center justify-center mx-auto text-sage-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-sage-800">Your Cart is Empty</h3>
                <p className="text-xs text-sage-500 max-w-xs mx-auto">
                  Explore our live masterclasses, culinary medicine workshops, and personalized programs.
                </p>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    router.push("/classes");
                  }}
                  className="px-5 py-2.5 rounded-full bg-annapoorna-600 hover:bg-annapoorna-700 text-white text-xs font-semibold shadow-xs transition-all"
                >
                  Browse Live Schedule
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-sand-50/70 border border-sand-200 space-y-3 relative group"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-annapoorna-700">
                        {item.product_type.replace(/_/g, " ")}
                      </span>
                      <h4 className="font-serif text-sm font-bold text-sage-900 leading-snug">
                        {item.product_name}
                      </h4>
                      {item.variation_meta?.session_title && (
                        <p className="text-[11px] text-sage-600">
                          📅 {item.variation_meta.session_title}
                        </p>
                      )}
                      {item.variation_meta?.instructor_name && (
                        <p className="text-[11px] text-sage-500">
                          Instructor: {item.variation_meta.instructor_name}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sage-400 hover:text-rose-600 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-sand-200/60 text-xs">
                    <span className="font-semibold text-sage-700">
                      Qty: {item.quantity}
                    </span>
                    <span className="font-serif text-sm font-bold text-sage-900">
                      {formatPrice(item.total_minor)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Actions */}
          {cart && cart.items.length > 0 && (
            <div className="p-6 border-t border-sand-200 bg-sand-50/70 space-y-4">
              <div className="space-y-1.5 text-xs text-sage-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-sage-900">{formatPrice(cart.subtotal_minor)}</span>
                </div>
                {cart.discount_minor > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({cart.coupon_code})</span>
                    <span>-{formatPrice(cart.discount_minor)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-serif font-bold text-sage-900 pt-1 border-t border-sand-200">
                  <span>Total</span>
                  <span className="text-annapoorna-700">{formatPrice(cart.total_minor)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    router.push(`/checkout?cart_id=${cart.cart_id}`);
                  }}
                  className="w-full py-3.5 rounded-full bg-annapoorna-600 hover:bg-annapoorna-700 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      router.push("/cart");
                    }}
                    className="flex-1 py-2.5 rounded-full bg-white hover:bg-sand-100 text-sage-800 text-xs font-semibold border border-sand-300 transition-all text-center"
                  >
                    View Full Cart
                  </button>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex-1 py-2.5 rounded-full bg-sand-200 hover:bg-sand-300 text-sage-800 text-xs font-semibold transition-all text-center"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-sage-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bank-Grade 256-Bit SSL Encryption</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
