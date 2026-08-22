"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Heart,
  Sparkles,
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Utensils,
  TrendingUp,
} from "lucide-react";

export default function AboutUsPage() {
  const leadershipTeam = [
    {
      name: "Dr. Maya Rao, MD",
      role: "Lead Lifestyle Medicine Physician & Medical Director",
      credentials: "Board Certified Internal Medicine • Harvard Lifestyle Medicine Fellow",
      image: "https://images.unsplash.com/photo-1594824813633-8987b7a2d488?auto=format&fit=crop&w=600&q=80",
      bio: "Specializing in the reversal of type 2 diabetes, insulin resistance, and hypertension through whole-food plant predominant nutrition and clinical habit transformation.",
    },
    {
      name: "Anita Desai",
      role: "Head of Culinary Medicine & Clinical Nutritionist",
      credentials: "MS Clinical Nutrition • Certified Whole-Food Plant Chef",
      image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80",
      bio: "Author of Ayurvedic Plant Medicine. Master of zero-oil culinary techniques, intact whole grain batch cooking, and culturally rich anti-inflammatory curries.",
    },
    {
      name: "James (Jim) Jones",
      role: "Director of Cohort Coaching & Habit Loops",
      credentials: "Certified Health Coach • Metabolic Fitness Specialist",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      bio: "Former prediabetes patient turned coach. Leads daily post-meal movement challenges, accountability pods, and circadian sleep optimization protocols.",
    },
  ];

  const clinicalImpact = [
    { stat: "94.2%", label: "Clinical A1c Reduction Rate", sub: "Patients reducing fasting blood glucose within 6 weeks" },
    { stat: "1,420+", label: "Active Cohort Members", sub: "Guided across structured 6-week lifestyle transformations" },
    { stat: "12,000+", label: "Whole Food Recipes Cooked", sub: "100% zero-oil, high-fiber, unrefined ingredients" },
    { stat: "6 / 6", label: "Pillars of Health Integrated", sub: "Nutrition, Movement, Sleep, Mind, Stress, Community" },
  ];

  return (
    <div className="bg-[#faf8f5] text-sage-900 font-sans">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 overflow-hidden border-b border-[#e5ddd3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[#C35B32] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Clinical Mission & Philosophy</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-sage-950 max-w-4xl mx-auto tracking-tight leading-tight">
            Restoring Metabolic Health Through the Science of Food & Lifestyle
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-sage-600 font-light leading-relaxed">
            Annapoorna Portal bridges the gap between clinical endocrinology and practical kitchen joy. We empower individuals to reverse chronic lifestyle diseases using evidence-based nutrition and sustainable daily habits.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/products"
              className="px-8 py-3.5 rounded-full bg-[#C35B32] hover:bg-[#4d2aa6] text-white text-sm font-semibold shadow-md transition-all flex items-center gap-2"
            >
              <span>Explore Programs & Classes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/classes"
              className="px-8 py-3.5 rounded-full bg-white hover:bg-sand-100 text-sage-900 border border-sand-300 text-sm font-semibold transition-all shadow-xs"
            >
              <span>View Live Calendar</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Clinical Impact Stats */}
      <section className="py-16 bg-white border-b border-[#e5ddd3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {clinicalImpact.map((item, idx) => (
              <div key={idx} className="space-y-2 text-center sm:text-left">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-[#C35B32] block">{item.stat}</span>
                <h3 className="font-serif font-bold text-base text-sage-950">{item.label}</h3>
                <p className="text-xs text-sage-500 font-light">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Story & Six Pillars Integration */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C35B32] block">Why Annapoorna Was Founded</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-sage-950 leading-snug">
              "Let Food Be Your Medicine, and Kitchen Your Sanctuary"
            </h2>
            <p className="text-sm text-sage-700 leading-relaxed font-light">
              Conventional healthcare often treats symptoms with escalating medications without resolving the root cause: cellular insulin resistance caused by intramyocellular lipids and ultra-processed inflammatory diets.
            </p>
            <p className="text-sm text-sage-700 leading-relaxed font-light">
              Named after <em>Annapoorna</em>, the ancient archetype of nourishing sustenance, our platform delivers an integrated ecosystem: physician-led clinical protocols, live interactive cooking labs, personalized meal plans, and peer accountability cohorts.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-xs text-sage-950 block">Evidence-Based Medicine</span>
                <p className="text-[11px] text-sage-500">Peer-reviewed lifestyle clinical trials and biomarker tracking.</p>
              </div>
              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1">
                <Utensils className="w-5 h-5 text-[#C35B32]" />
                <span className="font-bold text-xs text-sage-950 block">Zero-Oil Culinary Joy</span>
                <p className="text-[11px] text-sage-500">Delicious unrefined plant meals that make healthy living effortless.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-sand-300 bg-sand-200 h-96">
              <img
                src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80"
                alt="Whole fresh produce and culinary medicine"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Clinical Leadership & Faculty */}
        <div className="space-y-8 pt-12 border-t border-sand-200">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C35B32]">Faculty & Clinical Team</span>
            <h2 className="font-serif text-3xl font-bold text-sage-950">Meet Your Mentors & Specialists</h2>
            <p className="text-xs text-sage-600">Board-certified physicians, master culinary chefs, and certified metabolic health coaches.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadershipTeam.map((leader, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="h-64 rounded-2xl overflow-hidden bg-sand-200 border border-sand-300">
                    <img src={leader.image} alt={leader.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-sage-950">{leader.name}</h3>
                    <p className="text-xs font-bold text-[#C35B32] mt-0.5">{leader.role}</p>
                    <p className="text-[11px] text-sage-400 mt-0.5">{leader.credentials}</p>
                  </div>
                  <p className="text-xs text-sage-700 font-light leading-relaxed">{leader.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
