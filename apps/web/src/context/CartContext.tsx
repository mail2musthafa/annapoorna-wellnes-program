"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ApiClient } from "@/lib/api/client";
import { Cart, CartItem } from "@/types";

interface AddToCartParams {
  product_id: string;
  product_name?: string;
  product_type?: string;
  session_id?: string;
  seat_hold_id?: string;
  quantity?: number;
  unit_price_usd_cents?: number;
  unit_price_inr_paise?: number;
  variation_meta?: any;
}

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  currency: string;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  setCurrency: (curr: string) => void;
  addToCart: (params: AddToCartParams) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<string | null>;
  removeCoupon: () => Promise<void>;
  saveForLater: (itemId: string) => Promise<void>;
  moveToCart: (savedItemId: string, sessionId?: string, seatHoldId?: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [currency, setCurrencyState] = useState<string>("USD");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [guestToken, setGuestToken] = useState<string>("");

  const calculateCartTotals = (items: CartItem[], curr: string, discountPercent: number = 0, coupon?: string): Cart => {
    const subtotal = items.reduce((sum, item) => sum + item.total_minor, 0);
    const discount = Math.round((subtotal * discountPercent) / 100);
    const afterDiscount = subtotal - discount;
    const tax = Math.round(afterDiscount * 0.09); // 9% GST/tax
    const total = afterDiscount + tax;
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      cart_id: "cart_" + (guestToken || "guest_123"),
      currency: curr,
      items,
      saved_items: [],
      subtotal_minor: subtotal,
      discount_minor: discount,
      tax_minor: tax,
      total_minor: total,
      coupon_code: coupon,
      item_count: totalCount,
    };
  };

  const saveCartToStorage = (updatedCart: Cart) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("annapoorna_cart_v2", JSON.stringify(updatedCart));
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      let token = localStorage.getItem("annapoorna_guest_token");
      if (!token) {
        token = "guest_" + Math.random().toString(36).substring(2, 12);
        localStorage.setItem("annapoorna_guest_token", token);
      }
      setGuestToken(token);

      const savedCurrency = localStorage.getItem("annapoorna_currency") || "USD";
      setCurrencyState(savedCurrency);

      const storedCartJson = localStorage.getItem("annapoorna_cart_v2");
      if (storedCartJson) {
        try {
          const parsed = JSON.parse(storedCartJson);
          setCart(parsed);
        } catch (e) {}
      }
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!guestToken) return;
    try {
      const res = await ApiClient.get<Cart>(
        `/api/v1/cart?guest_token=${guestToken}&currency=${currency}`
      );
      if (res && res.items && res.items.length > 0) {
        setCart(res);
        saveCartToStorage(res);
      }
    } catch (err) {
      // Keep existing local cart
    }
  }, [guestToken, currency]);

  useEffect(() => {
    if (guestToken) {
      refreshCart();
    }
  }, [guestToken, currency, refreshCart]);

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    if (typeof window !== "undefined") {
      localStorage.setItem("annapoorna_currency", curr);
    }
    if (cart) {
      const updated = calculateCartTotals(cart.items, curr, cart.discount_minor > 0 ? 10 : 0, cart.coupon_code);
      setCart(updated);
      saveCartToStorage(updated);
    }
  };

  const addToCart = async (params: AddToCartParams) => {
    const qty = params.quantity || 1;
    const unitPrice = currency === "INR"
      ? (params.unit_price_inr_paise || 199900)
      : (params.unit_price_usd_cents || 2500);

    const currentItems = cart ? [...cart.items] : [];
    const existingIndex = currentItems.findIndex(
      (item) => item.product_id === params.product_id && item.session_id === params.session_id
    );

    if (existingIndex > -1) {
      currentItems[existingIndex].quantity += qty;
      currentItems[existingIndex].total_minor = currentItems[existingIndex].quantity * currentItems[existingIndex].unit_price_minor;
    } else {
      const newItem: CartItem = {
        id: "item_" + Math.random().toString(36).substring(2, 9),
        product_id: params.product_id,
        product_name: params.product_name || "Whole-Food Wellness Offering",
        product_type: params.product_type || "live_class",
        session_id: params.session_id,
        seat_hold_id: params.seat_hold_id,
        quantity: qty,
        unit_price_minor: unitPrice,
        total_minor: unitPrice * qty,
        variation_meta: params.variation_meta || {},
      };
      currentItems.push(newItem);
    }

    const updated = calculateCartTotals(
      currentItems,
      currency,
      cart && cart.discount_minor > 0 ? 10 : 0,
      cart?.coupon_code
    );

    setCart(updated);
    saveCartToStorage(updated);
    setIsDrawerOpen(true);

    // Sync to backend if available
    try {
      await ApiClient.post<Cart>("/api/v1/cart/items", {
        product_id: params.product_id,
        session_id: params.session_id,
        seat_hold_id: params.seat_hold_id,
        quantity: qty,
        guest_token: guestToken,
        currency,
        variation_meta: params.variation_meta,
      });
    } catch (e) {
      // Backend is optional; local cart is fully authoritative
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!cart) return;
    let currentItems = [...cart.items];
    if (quantity <= 0) {
      currentItems = currentItems.filter((i) => i.id !== itemId);
    } else {
      const item = currentItems.find((i) => i.id === itemId);
      if (item) {
        item.quantity = quantity;
        item.total_minor = item.quantity * item.unit_price_minor;
      }
    }

    const updated = calculateCartTotals(
      currentItems,
      currency,
      cart.discount_minor > 0 ? 10 : 0,
      cart.coupon_code
    );
    setCart(updated);
    saveCartToStorage(updated);
  };

  const removeItem = async (itemId: string) => {
    if (!cart) return;
    const currentItems = cart.items.filter((i) => i.id !== itemId);
    const updated = calculateCartTotals(
      currentItems,
      currency,
      cart.discount_minor > 0 ? 10 : 0,
      cart.coupon_code
    );
    setCart(updated);
    saveCartToStorage(updated);
  };

  const applyCoupon = async (code: string): Promise<string | null> => {
    if (!cart || cart.items.length === 0) return "Your cart is empty.";
    const upper = code.trim().toUpperCase();
    if (upper === "ANNAPOORNA10" || upper === "VITALITY" || upper === "WELCOME10") {
      const updated = calculateCartTotals(cart.items, currency, 10, upper);
      setCart(updated);
      saveCartToStorage(updated);
      return null;
    }
    return "Invalid coupon code. Try 'ANNAPOORNA10' for 10% off!";
  };

  const removeCoupon = async () => {
    if (!cart) return;
    const updated = calculateCartTotals(cart.items, currency, 0, undefined);
    setCart(updated);
    saveCartToStorage(updated);
  };

  const saveForLater = async (itemId: string) => {
    await removeItem(itemId);
  };

  const moveToCart = async (savedItemId: string, sessionId?: string, seatHoldId?: string) => {
    // No-op
  };

  const clearCart = () => {
    const empty = calculateCartTotals([], currency);
    setCart(empty);
    saveCartToStorage(empty);
  };

  const itemCount = cart ? cart.item_count : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        currency,
        isDrawerOpen,
        setIsDrawerOpen,
        setCurrency,
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        saveForLater,
        moveToCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
