"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Sparkles, BookOpen, Calendar, Utensils, User, Users, LogIn, ShoppingBag, ShieldAlert, Award, Store } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const { itemCount, setIsDrawerOpen, currency, setCurrency } = useCart();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("annapoorna_token"));
      const storedUser = localStorage.getItem("annapoorna_user");
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          setUserRoles(u.roles || []);
        } catch (e) {}
      }
    }
  }, []);

  const isAdmin = userRoles.includes("Super Administrator") || userRoles.includes("Administrator");
  const isExpert = userRoles.includes("Coach") || userRoles.includes("Nutritionist");

  return (
    <header className="sticky top-0 z-40 bg-sand-50/95 backdrop-blur-md border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-annapoorna-500 flex items-center justify-center text-white font-serif font-bold text-xl shadow-xs">
              अ
            </div>
            <div>
              <span className="font-serif text-2xl font-bold text-sage-900 tracking-tight block leading-tight">
                Annapoorna
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-annapoorna-700 block">
                Lifestyle Medicine & Wellness
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-sage-800">
            <Link href="/products" className="hover:text-annapoorna-600 transition-colors flex items-center gap-1.5">
              <Store className="w-4 h-4 text-annapoorna-500" />
              Wellness Store
            </Link>
            <Link href="/classes" className="hover:text-annapoorna-600 transition-colors flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sage-600" />
              Live Calendar
            </Link>
            <Link href="/pillars" className="hover:text-annapoorna-600 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sage-600" />
              Six Pillars
            </Link>
            <Link href="/recipes" className="hover:text-annapoorna-600 transition-colors flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-sage-600" />
              Recipes
            </Link>
            <Link href="/about" className="hover:text-annapoorna-600 transition-colors flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sage-600" />
              About Us
            </Link>
            <Link href="/lead-guide" className="hover:text-annapoorna-600 transition-colors flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sage-600" />
              Free Guide
            </Link>
          </nav>

          {/* Cart and Auth Controls */}
          <div className="hidden md:flex items-center space-x-4">

            {/* Persistent Cart Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2.5 rounded-full bg-white border border-sand-200 text-sage-800 hover:bg-sand-100 transition-colors cursor-pointer"
              aria-label={`Shopping Cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-annapoorna-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Portal & Auth Navigation */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-sand-200 text-sage-900 hover:bg-sand-300 transition-all"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-annapoorna-600" />
                    Admin
                  </Link>
                )}
                {isExpert && (
                  <Link
                    href="/expert"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-all"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-700" />
                    Expert
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-sage-800 text-white hover:bg-sage-900 shadow-sm transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  Workspace
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage-800 hover:text-annapoorna-600 px-3 py-2 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center px-4 py-2.5 rounded-full text-xs font-semibold bg-annapoorna-600 text-white hover:bg-annapoorna-700 shadow-sm transition-all"
                >
                  Explore Store
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 rounded-full bg-white border border-sand-200 text-sage-800"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-annapoorna-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-sage-800 hover:bg-sand-100"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-b border-sand-200 bg-sand-50 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/products"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-sage-800 hover:bg-sand-100"
          >
            Wellness Store
          </Link>
          <Link
            href="/classes"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-sage-800 hover:bg-sand-100"
          >
            Live Classes & Calendar
          </Link>
          <Link
            href="/pillars"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-sage-800 hover:bg-sand-100"
          >
            Six Lifestyle Pillars
          </Link>
          <Link
            href="/recipes"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-sage-800 hover:bg-sand-100"
          >
            Culinary Medicine Recipes
          </Link>
          <Link
            href="/lead-guide"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-sage-800 hover:bg-sand-100"
          >
            Free Starter Guide
          </Link>
          <div className="pt-4 border-t border-sand-200 space-y-2">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center py-2.5 rounded-full text-sm font-semibold bg-annapoorna-600 text-white"
            >
              Member Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
