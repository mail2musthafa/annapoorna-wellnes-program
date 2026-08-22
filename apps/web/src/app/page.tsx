"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
  Apple,
  Activity,
  Moon,
  Users,
  CheckCircle2,
  Calendar,
  Utensils,
  Store,
  BookOpen,
  TrendingDown,
  Flame,
  Star,
  Quote,
  Clock,
  PlayCircle,
  Award,
} from "lucide-react";

export default function HomePage() {
  const pillars = [
    { title: "Nutrition", desc: "Whole plant nourishment and metabolic insulin sensitivity.", icon: Apple, color: "text-emerald-700", bg: "bg-emerald-50" },
    { title: "Movement", desc: "40-min postprandial walking and daily functional mobility.", icon: Activity, color: "text-amber-700", bg: "bg-amber-50" },
    { title: "Restorative Sleep", desc: "Circadian sleep rhythm and 90-min digital sunset.", icon: Moon, color: "text-indigo-700", bg: "bg-indigo-50" },
    { title: "Mindfulness", desc: "Pranayama breathwork, meditation, and calm focus.", icon: Heart, color: "text-rose-700", bg: "bg-rose-50" },
    { title: "Community", desc: "Peer accountability circles and live mentor support.", icon: Users, color: "text-teal-700", bg: "bg-teal-50" },
    { title: "Clean Habits", desc: "Endothelial protection and long-term habit consistency.", icon: ShieldCheck, color: "text-orange-700", bg: "bg-orange-50" },
  ];

  const transformations = [
    {
      name: "Kathy Gaither",
      badge: "🔥 42-Day Streak",
      a1cBefore: "9.2%",
      a1cAfter: "5.4%",
      glucose: "98 mg/dL flatline",
      medsReduced: "Off Metformin & Glipizide",
      story: "My fasting glucose dropped from 145 to a steady 98 mg/dL. Following Dr. Maya's whole-plant protocol and 40-minute walks with my buddy gave me my energy back!",
      evidenceImg: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
      cgmCaption: "Verified CGM Flatline & Lab Panel",
    },
    {
      name: "James (Jim) Jones",
      badge: "🔥 38-Day Streak",
      a1cBefore: "8.8%",
      a1cAfter: "5.6%",
      glucose: "Down 28 lbs",
      medsReduced: "Blood pressure normalized (118/76)",
      story: "The zero-oil Indian dal recipes and sprouted legumes made the transition effortless. I never feel deprived, and my cardiologist was stunned at my 3-month lipid panel.",
      evidenceImg: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
      cgmCaption: "Endothelial Health & Weight Tracker",
    },
    {
      name: "Rajesh Kumar",
      badge: "🌱 Week 6 Graduate",
      a1cBefore: "8.1%",
      a1cAfter: "5.7%",
      glucose: "102 mg/dL fasting",
      medsReduced: "Insulin dosage cut by 70%",
      story: "Chef Anita's culinary masterclasses showed me how to make authentic Indian curries without a single drop of refined oil. My post-meal glucose spikes completely disappeared!",
      evidenceImg: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
      cgmCaption: "Whole Plant Fiber Biomarker Log",
    },
  ];

  const communityConversations = [
    {
      author: "Kathy Gaither 🔥",
      avatar: "K",
      time: "5 hours ago",
      text: "Food journal, CGM flatline (98 mg/dL) and a picture of my walking buddy for today! Zero-oil mung dal bowl was incredible.",
      likes: 42,
      comments: 6,
      facultyReply: "Dr. Maya Rao, MD: 'Outstanding consistency Kathy! Contraction-mediated glucose uptake during that 40-min walk is working wonders for your insulin receptors.'",
    },
    {
      author: "Sarah Lin 🌙",
      avatar: "S",
      time: "Yesterday",
      text: "Completed week 3 of the Circadian Sunset protocol. Powering down devices by 8:30 PM got my deep sleep from 42 mins to 1 hr 25 mins!",
      likes: 29,
      comments: 4,
      facultyReply: "Anita Desai: 'Melatonin synthesis and liver glycogen rest work hand-in-hand. Keep up this magnificent routine Sarah!'",
    },
  ];

  return (
    <div className="bg-[#faf8f5] text-sage-900 font-sans">
      {/* 1. Hero Section (Mastering Diabetes / Outcome-Focused Funnel) */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-[#e5ddd3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-[#C35B32] shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Evidence-Based Lifestyle Medicine & Endocrinology
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-sage-950 leading-tight tracking-tight">
              Reverse Insulin Resistance & Restore Vibrant Health
            </h1>

            <p className="text-base sm:text-lg text-sage-600 leading-relaxed font-light">
              Join thousands who have reversed type 2 diabetes, lowered their A1c below 5.7%, and reclaimed boundless energy through whole-food plant nutrition and clinical coaching.
            </p>

            {/* Header Direct Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/products"
                className="px-7 py-3 rounded-full bg-[#C35B32] hover:bg-[#4d2aa6] text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                <span>Wellness Store</span>
              </Link>
              <Link
                href="/classes"
                className="px-6 py-3 rounded-full bg-white hover:bg-sand-100 border border-sand-300 text-sage-900 font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-[#C35B32]" />
                <span>Live Calendar</span>
              </Link>
              <Link
                href="/pillars"
                className="px-6 py-3 rounded-full bg-white hover:bg-sand-100 border border-sand-300 text-sage-900 font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Six Pillars</span>
              </Link>
              <Link
                href="/lead-guide"
                className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Free Guide</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Real Transformation Evidence & Testimonials with Screenshots */}
      <section className="py-20 bg-white border-b border-[#e5ddd3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C35B32]">Real Clinical Outcomes</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-sage-950">
              Verified Patient Transformations
            </h2>
            <p className="text-xs text-sage-600">
              Real members sharing verified Continuous Glucose Monitor (CGM) flatlines, lab panels, and lifestyle milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {transformations.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#faf8f5] rounded-3xl border border-[#e5ddd3] shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#C35B32] transition-all"
              >
                <div className="space-y-4">
                  {/* Photo & Caption Header */}
                  <div className="relative h-48 bg-sand-200 overflow-hidden">
                    <img src={item.evidenceImg} alt={item.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full">
                        {item.cgmCaption}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-base text-sage-950">{item.name}</h3>
                        <span className="text-[10px] text-sage-500 font-semibold">{item.medsReduced}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {item.badge}
                      </span>
                    </div>

                    {/* A1c Metric Comparison */}
                    <div className="p-3 bg-white rounded-2xl border border-sand-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-sage-400 uppercase font-bold block">Starting A1c:</span>
                        <span className="font-serif font-bold text-rose-600 text-base">{item.a1cBefore}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-sage-400" />
                      <div>
                        <span className="text-[10px] text-sage-400 uppercase font-bold block">Current A1c:</span>
                        <span className="font-serif font-bold text-emerald-600 text-base">{item.a1cAfter}</span>
                      </div>
                    </div>

                    <p className="text-xs text-sage-700 font-light leading-relaxed italic">
                      "{item.story}"
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    <span className="text-[10px] font-bold text-sage-600 ml-1.5">Verified Cohort Result</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Community Conversations & Peer Feed Social Proof */}
      <section className="py-20 bg-[#faf8f5] border-b border-[#e5ddd3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C35B32]">Vibrant Peer Accountability</span>
            <h2 className="font-serif text-3xl font-bold text-sage-950">
              Live from the Member Community
            </h2>
            <p className="text-xs text-sage-600">
              Daily habit logs, food journals, and expert feedback inside our private member workspace.
            </p>
          </div>

          <div className="space-y-6">
            {communityConversations.map((post, idx) => (
              <div key={idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C35B32] text-white font-bold flex items-center justify-center text-sm">
                      {post.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-sage-950">{post.author}</h4>
                      <span className="text-[10px] text-sage-500">{post.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-sage-500">
                    <span className="flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                      ❤️ {post.likes}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-[#C35B32] bg-purple-50 px-2 py-0.5 rounded-full">
                      💬 {post.comments}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-sage-800 leading-relaxed font-light whitespace-pre-line">
                  {post.text}
                </p>

                {/* Faculty Reply Box */}
                <div className="p-4 bg-[#faf7f2] rounded-2xl border border-[#e8dfd5] text-xs space-y-1">
                  <span className="font-bold text-[#C35B32] block text-[11px]">Faculty Physician Response:</span>
                  <p className="text-sage-700 font-light leading-relaxed">{post.facultyReply}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              href="/dashboard/community"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#C35B32] hover:underline"
            >
              <span>Explore Community Forum in Member Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Featured Recipes & Culinary Medicine Masterclasses */}
      <section className="py-20 bg-white border-b border-[#e5ddd3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">Culinary Medicine Archives</span>
              <h2 className="font-serif text-3xl font-bold text-sage-950">Bonus Recipes & Cooking Tutorials</h2>
              <p className="text-xs text-sage-600">Replays of live cooking masterclasses, complete with exact ingredient ratios and clinical tips.</p>
            </div>
            <Link
              href="/recipes"
              className="px-5 py-2.5 rounded-full bg-sand-100 hover:bg-sand-200 text-sage-800 text-xs font-semibold border border-sand-300 transition-all flex items-center gap-1.5"
            >
              <span>Explore All Recipes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/recipes/adobo-mushroom-bowl" className="group rounded-3xl overflow-hidden border border-[#e5ddd3] bg-white shadow-xs hover:border-[#C35B32] transition-all flex flex-col justify-between">
              <div className="grid grid-cols-12 h-44 bg-[#163B8A] text-white">
                <div className="col-span-7 p-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-purple-200 block">Blue Zone Masterclass</span>
                    <h3 className="font-serif text-sm font-bold leading-tight group-hover:text-amber-300 transition-colors">
                      Adobo Mushroom Bowl
                    </h3>
                  </div>
                  <span className="text-[10px] text-sand-300 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 24 min replay
                  </span>
                </div>
                <div className="col-span-5 relative overflow-hidden bg-sand-200">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"
                    alt="Adobo Mushroom Bowl"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="p-4 bg-white flex items-center justify-between text-xs font-semibold text-sage-700">
                <span>Zero-Oil • High-Fiber</span>
                <span className="text-[#C35B32] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">Watch Tutorial →</span>
              </div>
            </Link>

            <Link href="/recipes/cherry-balsamic-chickpea" className="group rounded-3xl overflow-hidden border border-[#e5ddd3] bg-white shadow-xs hover:border-[#C35B32] transition-all flex flex-col justify-between">
              <div className="grid grid-cols-12 h-44 bg-[#163B8A] text-white">
                <div className="col-span-7 p-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-purple-200 block">Satiety Protocol</span>
                    <h3 className="font-serif text-sm font-bold leading-tight group-hover:text-amber-300 transition-colors">
                      Cherry Balsamic Chickpea
                    </h3>
                  </div>
                  <span className="text-[10px] text-sand-300 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 18 min replay
                  </span>
                </div>
                <div className="col-span-5 relative overflow-hidden bg-sand-200">
                  <img
                    src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80"
                    alt="Cherry Balsamic Chickpea"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="p-4 bg-white flex items-center justify-between text-xs font-semibold text-sage-700">
                <span>Polyphenol-Rich • Low-GI</span>
                <span className="text-[#C35B32] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">Watch Tutorial →</span>
              </div>
            </Link>

            <Link href="/recipes/sesame-ginger-edamame" className="group rounded-3xl overflow-hidden border border-[#e5ddd3] bg-white shadow-xs hover:border-[#C35B32] transition-all flex flex-col justify-between">
              <div className="grid grid-cols-12 h-44 bg-[#163B8A] text-white">
                <div className="col-span-7 p-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-purple-200 block">Anti-Inflammatory</span>
                    <h3 className="font-serif text-sm font-bold leading-tight group-hover:text-amber-300 transition-colors">
                      Sesame Ginger Edamame
                    </h3>
                  </div>
                  <span className="text-[10px] text-sand-300 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 22 min replay
                  </span>
                </div>
                <div className="col-span-5 relative overflow-hidden bg-sand-200">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80"
                    alt="Sesame Ginger Edamame"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <div className="p-4 bg-white flex items-center justify-between text-xs font-semibold text-sage-700">
                <span>Prebiotic Fiber • Clean Sauté</span>
                <span className="text-[#C35B32] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">Watch Tutorial →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Six Pillars Breakdown Section */}
      <section className="py-20 bg-white border-b border-[#e5ddd3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">Holistic Architecture</span>
            <h2 className="font-serif text-3xl font-bold text-sage-950">The Six Pillars of Health</h2>
            <p className="text-xs text-sage-600">
              Evidence-based lifestyle interventions tailored to your unique metabolic profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="p-6 rounded-3xl border border-[#e5ddd3] bg-[#faf8f5] space-y-3 hover:border-[#C35B32] transition-all">
                  <div className={`w-10 h-10 rounded-2xl ${p.bg} ${p.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-sage-950">{p.title}</h3>
                  <p className="text-xs text-sage-600 leading-relaxed font-light">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Free Starter Guide Lead Magnet CTA */}
      <section className="py-20 bg-gradient-to-br from-[#163B8A] to-[#C35B32] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-[10px] uppercase font-bold tracking-widest text-purple-200 bg-white/10 px-3 py-1 rounded-full inline-block">
            Free Master Guide Download
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold">
            Get the Complete Whole-Food Plant Starter Protocol
          </h2>
          <p className="text-sm sm:text-base text-purple-100 font-light max-w-2xl mx-auto leading-relaxed">
            Download our 42-page handbook featuring zero-oil pantry staples, 14-day starter meal plans, and the clinical 40-minute walking guideline.
          </p>
          <div className="pt-2">
            <Link
              href="/lead-guide"
              className="px-8 py-3.5 rounded-full bg-white hover:bg-sand-100 text-[#C35B32] font-semibold text-xs shadow-lg transition-all inline-flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Download Free Guide Now</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
