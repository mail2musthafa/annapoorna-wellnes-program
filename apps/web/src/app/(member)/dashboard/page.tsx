"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Utensils,
  BookOpen,
  ArrowRight,
  PlayCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Users,
  ChevronDown,
  Layers,
  Award,
  Video,
} from "lucide-react";
import { ApiClient } from "@/lib/api/client";

export default function MemberDashboardOverview() {
  const [userName, setUserName] = useState("Priya Sharma");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("annapoorna_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.first_name) setUserName(`${u.first_name} ${u.last_name || ""}`);
        } catch (e) {}
      }
    }
  }, []);

  const tutorialCards = [
    {
      id: "mdu-1",
      title: "ADOBO MUSHROOM BOWL (BLUE ZONE)",
      subtitle: "30-Min Anti-Inflammatory Lunch",
      instructor: "Shobha Swamy",
      duration: "24 min",
      category: "quick_meals",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "mdu-2",
      title: "CHERRY BALSAMIC CHICKPEA",
      subtitle: "High-Fiber Blood Sugar Stabilizer",
      instructor: "Dr. Maya Rao",
      duration: "18 min",
      category: "quick_meals",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "mdu-3",
      title: "SESAME GINGER (BLUE ZONE)",
      subtitle: "Zero-Oil Stir-Fry Masterclass",
      instructor: "Shobha Swamy",
      duration: "32 min",
      category: "quick_meals",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "mdu-4",
      title: "APRICOT BLACK BEAN CORN BOWL",
      subtitle: "Metabolic Reset Nutrient Density",
      instructor: "Ananya Mehta",
      duration: "21 min",
      category: "healing_bowls",
      image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "mdu-5",
      title: "CAULIFLOWER BLACK BEAN SALSA",
      subtitle: "Cardiovascular Support Recipe",
      instructor: "Dr. Maya Rao",
      duration: "28 min",
      category: "healing_bowls",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "mdu-6",
      title: "WHITE BEAN & ARTICHOKE SALAD",
      subtitle: "Microbiome Restoration Protocol",
      instructor: "Kavita Nair",
      duration: "19 min",
      category: "healing_bowls",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Top Banner: Mastering Diabetes / Incorvo Style Header */}
      <div className="bg-[#163B8A] text-white p-8 sm:p-10 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" /> Six Pillars Protocol • Active Cohort Week 3
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Namaste, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-light leading-relaxed">
            Welcome to your holistic wellness workspace. Your 2-stage clinical nutrition plan is approved, and your next live masterclass starts tomorrow.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto">
          <Link
            href="/dashboard/classes"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-600 text-sage-950 font-bold text-xs shadow-md transition-all text-center flex items-center justify-center gap-2"
          >
            <Video className="w-4 h-4" /> Join Live Office Hours
          </Link>
          <Link
            href="/dashboard/nutrition-plan"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all text-center"
          >
            View Nutrition Plan
          </Link>
        </div>

        {/* Ambient Decorative Background Glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#5F35C5]/40 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-[#e5ddd3] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-sage-500">
            <span>Metabolic Health Score</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">+14%</span>
          </div>
          <div className="font-serif text-3xl font-bold text-sage-950">92 / 100</div>
          <p className="text-[11px] text-sage-500">Consistently within optimal glucose target</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#e5ddd3] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-sage-500">
            <span>Enrolled Programs</span>
            <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">Active</span>
          </div>
          <div className="font-serif text-3xl font-bold text-sage-950">6-Week Reset</div>
          <p className="text-[11px] text-sage-500">Week 3 of 6 • 50% completed</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#e5ddd3] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-sage-500">
            <span>Pillars In Focus</span>
            <span className="text-annapoorna-700 font-bold bg-sand-100 px-2 py-0.5 rounded-md">6 of 6</span>
          </div>
          <div className="font-serif text-3xl font-bold text-sage-950">Holistic Core</div>
          <p className="text-[11px] text-sage-500">Nutrition, Movement, Rest, Mind</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#e5ddd3] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-sage-500">
            <span>VIP Pass Status</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Verified</span>
          </div>
          <div className="font-serif text-3xl font-bold text-sage-950">All-Access</div>
          <p className="text-[11px] text-sage-500">Next renewal: Sep 22, 2026</p>
        </div>
      </div>

      {/* Bonus Recipes & Cooking Tutorials Section (Mastering Diabetes University Style) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#e5ddd3] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5F35C5] text-white font-bold flex items-center justify-center shadow-xs">
              b
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-sage-950">
                Bonus Recipes & Cooking Tutorials
              </h2>
              <p className="text-xs text-sage-500">
                Bonus recipes & replays of LIVE cooking shows with evidence-informed culinary techniques.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-sage-600">
            <span>Ridiculously Easy Meals (31 Parts)</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Recipe / Masterclass Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorialCards.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-[#e5ddd3] shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
            >
              {/* Split Header Card: Dark Indigo Banner + Right Food Image (Exact MDU Screenshot Pattern) */}
              <div className="flex h-36 bg-[#163B8A] text-white overflow-hidden relative">
                {/* Left Title Banner */}
                <div className="flex-1 p-4 flex flex-col justify-between bg-gradient-to-r from-[#163B8A] to-[#2B1B6D] z-10">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400">
                    Annapoorna Lab
                  </span>
                  <h4 className="font-sans font-black text-sm uppercase leading-tight tracking-tight text-white drop-shadow-sm">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-200">
                    <Clock className="w-3 h-3" />
                    <span>{item.duration}</span>
                  </div>
                </div>

                {/* Right Photographic Dish Image */}
                <div className="w-2/5 h-full relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <h5 className="font-serif text-sm font-bold text-sage-900 group-hover:text-annapoorna-600 transition-colors">
                    {item.title}
                  </h5>
                  <p className="text-xs text-sage-500 mt-0.5">{item.subtitle}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-sand-100 text-[11px] text-sage-500">
                  <span>Instructor: {item.instructor}</span>
                  <span className="font-semibold text-annapoorna-700 flex items-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5" /> Watch Replay
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
