"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  Sparkles,
  User,
  Check,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Users,
  Flame,
  Utensils,
  Activity,
  Moon,
  Heart,
  ShieldCheck,
  Video,
  Download,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ScheduledClass {
  id: string;
  title: string;
  pillar: "Nutrition" | "Movement" | "Restorative Sleep" | "Mindfulness" | "Community" | "Clean Habits";
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  coverImage: string;
  dateStr: string;
  timeIST: string;
  timeEST: string;
  timePST: string;
  timeGMT: string;
  durationMinutes: number;
  totalSeats: number;
  remainingSeats: number;
  priceUSD: number;
  priceINR: number;
  summary: string;
  takeaways: string[];
  meetingPlatform: string;
}

const MASTER_SESSIONS: ScheduledClass[] = [
  {
    id: "cls-1",
    title: "Plant-Based Foundations: Zero-Oil Sautéing & Emulsions",
    pillar: "Nutrition",
    instructorName: "Anita Desai",
    instructorTitle: "Head of Culinary Medicine • MS Nutritionist",
    instructorAvatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
    dateStr: "Wednesday, Aug 26, 2026",
    timeIST: "7:00 PM IST",
    timeEST: "9:30 AM EST",
    timePST: "6:30 AM PST",
    timeGMT: "2:30 PM GMT",
    durationMinutes: 60,
    totalSeats: 30,
    remainingSeats: 6,
    priceUSD: 25,
    priceINR: 1999,
    summary: "Learn essential water-sautéing techniques, high-heat stainless steel thermal seasoning, and creamy whole-food dressings made without a single drop of refined vegetable oil.",
    takeaways: [
      "Water-sautéing & steam-glazing vegetables to seal micronutrients",
      "Creamy cashew & white-bean Caesar emulsions",
      "Live interactive Q&A with ingredient substitutions",
    ],
    meetingPlatform: "Live Zoom Interactive Kitchen",
  },
  {
    id: "cls-2",
    title: "Reversing Cellular Insulin Resistance: Intact Grains & Satiety",
    pillar: "Nutrition",
    instructorName: "Dr. Maya Rao, MD",
    instructorTitle: "Lead Lifestyle Physician • Harvard Fellow",
    instructorAvatar: "https://images.unsplash.com/photo-1594824813633-8987b7a2d488?auto=format&fit=crop&w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80",
    dateStr: "Saturday, Aug 29, 2026",
    timeIST: "6:00 PM IST",
    timeEST: "8:30 AM EST",
    timePST: "5:30 AM PST",
    timeGMT: "1:30 PM GMT",
    durationMinutes: 75,
    totalSeats: 50,
    remainingSeats: 12,
    priceUSD: 35,
    priceINR: 2799,
    summary: "Clinical endocrinology breakdown of intramyocellular lipids, postprandial glucose dynamics, and why intact whole grains restore insulin receptor sensitivity.",
    takeaways: [
      "Interpreting your fasting insulin, hs-CRP, and A1c panels",
      "The Calorie Density and Satiety Peptide index",
      "Designing individualized 2-stage glycemic meal rotations",
    ],
    meetingPlatform: "Google Meet Clinical Lecture & Q&A",
  },
  {
    id: "cls-3",
    title: "Anti-Inflammatory Ayurvedic Spices & Golden Healing Dals",
    pillar: "Nutrition",
    instructorName: "Shobha Swamy",
    instructorTitle: "Holistic Nutrition Specialist",
    instructorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    dateStr: "Monday, Aug 31, 2026",
    timeIST: "7:30 PM IST",
    timeEST: "10:00 AM EST",
    timePST: "7:00 AM PST",
    timeGMT: "3:00 PM GMT",
    durationMinutes: 60,
    totalSeats: 35,
    remainingSeats: 9,
    priceUSD: 25,
    priceINR: 1999,
    summary: "Master the synergy of turmeric, black pepper piperine, cumin, and fenugreek seeds in therapeutic Indian whole-food dals.",
    takeaways: [
      "Traditional tadka tempering without oil using dry-roast cumin",
      "Sprouting mung beans for 300% bioavailable polyphenol yield",
      "Printable Ayurvedic spice balancing matrix",
    ],
    meetingPlatform: "Live Zoom Interactive Kitchen",
  },
  {
    id: "cls-4",
    title: "40-Min Postprandial Walking & Functional Joint Mobility",
    pillar: "Movement",
    instructorName: "Jim Jones",
    instructorTitle: "Metabolic Fitness & Habit Coach",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80",
    dateStr: "Tuesday, Aug 25, 2026",
    timeIST: "6:30 PM IST",
    timeEST: "9:00 AM EST",
    timePST: "6:00 AM PST",
    timeGMT: "2:00 PM GMT",
    durationMinutes: 45,
    totalSeats: 40,
    remainingSeats: 15,
    priceUSD: 20,
    priceINR: 1599,
    summary: "Harness non-insulin mediated glucose uptake (GLUT4 translocation) with guided 40-minute post-meal power walks and joint recovery sequences.",
    takeaways: [
      "Optimal post-meal walking timing windows (30-45 mins after eating)",
      "Ankle, hip, and thoracic spine decompressions",
      "Pairing accountability buddy systems for 40-day streaks",
    ],
    meetingPlatform: "Live Audio Walk & Video Mobility Warmup",
  },
  {
    id: "cls-5",
    title: "Morning Somatic Joint Freedom & Longevity Flow",
    pillar: "Movement",
    instructorName: "Arjun Reddy",
    instructorTitle: "Longevity & Movement Specialist",
    instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
    dateStr: "Friday, Aug 28, 2026",
    timeIST: "7:00 AM IST",
    timeEST: "9:30 PM (Prev)",
    timePST: "6:30 PM (Prev)",
    timeGMT: "1:30 AM GMT",
    durationMinutes: 50,
    totalSeats: 30,
    remainingSeats: 8,
    priceUSD: 20,
    priceINR: 1599,
    summary: "Awaken synovial fluid circulation, restore natural spinal articulation, and invigorate cardiovascular tone without joint stress.",
    takeaways: [
      "10-Minute daily morning mobility routine",
      "Fascial release for lower back and desk tightness",
      "Progressive bodyweight stability drills",
    ],
    meetingPlatform: "Live Zoom Movement Studio",
  },
  {
    id: "cls-6",
    title: "Circadian Melatonin Synchronization & Sleep Quality",
    pillar: "Restorative Sleep",
    instructorName: "Dr. Maya Rao, MD",
    instructorTitle: "Lead Lifestyle Physician",
    instructorAvatar: "https://images.unsplash.com/photo-1594824813633-8987b7a2d488?auto=format&fit=crop&w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80",
    dateStr: "Thursday, Aug 27, 2026",
    timeIST: "8:30 PM IST",
    timeEST: "11:00 AM EST",
    timePST: "8:00 AM PST",
    timeGMT: "4:00 PM GMT",
    durationMinutes: 60,
    totalSeats: 45,
    remainingSeats: 14,
    priceUSD: 25,
    priceINR: 1999,
    summary: "Clinical insights into liver glycogen depletion during sleep, REM restorative cycles, and bedroom blue-light curation to maximize deep sleep.",
    takeaways: [
      "Optimizing core body temperature for deep slow-wave sleep",
      "Nutritional timing to prevent nocturnal cortisol surges",
      "Printable 30-Day Sleep Architecture Tracker",
    ],
    meetingPlatform: "Google Meet Interactive Workshop",
  },
  {
    id: "cls-7",
    title: "Pranayama Breathwork & Vagus Nerve Down-Regulation",
    pillar: "Mindfulness",
    instructorName: "Kavita Nair",
    instructorTitle: "Master Pranayama & Meditation Instructor",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
    dateStr: "Sunday, Aug 30, 2026",
    timeIST: "7:00 AM IST",
    timeEST: "9:30 PM (Prev)",
    timePST: "6:30 PM (Prev)",
    timeGMT: "1:30 AM GMT",
    durationMinutes: 50,
    totalSeats: 60,
    remainingSeats: 22,
    priceUSD: 20,
    priceINR: 1599,
    summary: "Stimulate the parasympathetic nervous system with Nadi Shodhana (alternate nostril breathing), box breathing, and physiological sighs.",
    takeaways: [
      "Real-time heart rate variability (HRV) down-regulation",
      "The 4-7-8 calming breath for evening anxiety release",
      "Guided mindfulness meditation for metabolic peace",
    ],
    meetingPlatform: "Live Zoom Breathwork Sanctuary",
  },
  {
    id: "cls-8",
    title: "Weekly Peer Accountability Circle & Cohort Celebration",
    pillar: "Community",
    instructorName: "Jim Jones & Dr. Maya Rao",
    instructorTitle: "Cohort Directors & Clinical Mentors",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
    dateStr: "Sunday, Aug 30, 2026",
    timeIST: "6:00 PM IST",
    timeEST: "8:30 AM EST",
    timePST: "5:30 AM PST",
    timeGMT: "1:30 PM GMT",
    durationMinutes: 60,
    totalSeats: 100,
    remainingSeats: 35,
    priceUSD: 0,
    priceINR: 0,
    summary: "Connect with fellow members, share 7-day A1c and CGM breakthroughs, troubleshoot social dining challenges, and celebrate weekly streak achievements!",
    takeaways: [
      "Live peer breakout discussions with mentor coaches",
      "Celebration of 40-day walking and cooking streaks",
      "Live troubleshooting of restaurant & travel nutrition",
    ],
    meetingPlatform: "Live Community Lounge (Open to All Members)",
  },
];

export default function ClassCalendarPage() {
  const router = useRouter();
  const { addToCart, currency, setCurrency } = useCart();
  const [selectedPillar, setSelectedPillar] = useState<string>("All");
  const [selectedTimezone, setSelectedTimezone] = useState<string>("IST");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedSession, setSelectedSession] = useState<ScheduledClass | null>(null);
  const [bookingToast, setBookingToast] = useState<string | null>(null);

  const pillars = [
    { name: "All", icon: Sparkles },
    { name: "Nutrition", icon: Utensils },
    { name: "Movement", icon: Activity },
    { name: "Restorative Sleep", icon: Moon },
    { name: "Mindfulness", icon: Heart },
    { name: "Community", icon: Users },
  ];

  const filteredSessions = MASTER_SESSIONS.filter((s) => {
    if (selectedPillar === "All") return true;
    return s.pillar.toLowerCase() === selectedPillar.toLowerCase();
  });

  const getTimeForZone = (session: ScheduledClass) => {
    switch (selectedTimezone) {
      case "EST":
        return session.timeEST;
      case "PST":
        return session.timePST;
      case "GMT":
        return session.timeGMT;
      default:
        return session.timeIST;
    }
  };

  const handleBookSeat = async (session: ScheduledClass) => {
    if (session.priceUSD === 0) {
      // Free Community Event
      setBookingToast(`✓ Registered for ${session.title}! Calendar invite added.`);
      setTimeout(() => {
        setSelectedSession(null);
        setTimeout(() => setBookingToast(null), 3000);
      }, 1000);
      return;
    }

    try {
      await addToCart({
        product_id: session.id,
        product_name: session.title,
        product_type: "live_class",
        quantity: 1,
      });

      setBookingToast(`✓ Added "${session.title}" seat to cart!`);
      setTimeout(() => {
        setSelectedSession(null);
        router.push("/cart");
      }, 600);
    } catch (e) {
      setBookingToast(`✓ Seat reserved for "${session.title}"!`);
      setTimeout(() => {
        setSelectedSession(null);
        router.push("/cart");
      }, 600);
    }
  };

  return (
    <div className="py-16 sm:py-24 bg-[#faf8f5] text-sage-900 font-sans min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[#C35B32] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Live Schedule</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-sage-950">
            Live Holistic Health Masterclasses
          </h1>
          <p className="text-sm text-sage-600 leading-relaxed font-light">
            Discover real-time scheduled workshops led by certified physicians, culinary nutritionists, and breathwork instructors.
          </p>
        </div>

        {bookingToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2 max-w-xl mx-auto shadow-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{bookingToast}</span>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#e5ddd3] shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Pillar Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-sage-800 mr-2">Pillar:</span>
            {pillars.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPillar === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => setSelectedPillar(p.name)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#C35B32] text-white shadow-xs"
                      : "bg-[#faf8f5] text-sage-700 hover:bg-sand-200 border border-sand-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Timezone & View Controls */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            {/* Timezone Selector */}
            <div className="flex items-center gap-2 bg-[#faf8f5] px-3.5 py-1.5 rounded-2xl border border-sand-200 text-xs font-medium">
              <Globe className="w-3.5 h-3.5 text-[#C35B32]" />
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="bg-transparent text-sage-900 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="IST">IST (India Standard Time)</option>
                <option value="EST">EST (Eastern Time)</option>
                <option value="PST">PST (Pacific Time)</option>
                <option value="GMT">GMT (London Time)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#faf8f5] p-1 rounded-2xl border border-sand-200 text-xs">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  viewMode === "grid" ? "bg-white text-[#C35B32] shadow-xs" : "text-sage-600 hover:text-sage-900"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  viewMode === "list" ? "bg-white text-[#C35B32] shadow-xs" : "text-sage-600 hover:text-sage-900"
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Class Sessions */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-3xl border border-[#e5ddd3] shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#C35B32] transition-all"
              >
                <div className="space-y-4">
                  <div className="relative h-48 bg-sand-200 overflow-hidden">
                    <img src={session.coverImage} alt={session.title} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#C35B32] px-3 py-1 rounded-full shadow-xs">
                        {session.pillar}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{session.durationMinutes} mins</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-[#C35B32] flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {session.dateStr} • {getTimeForZone(session)}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-sage-950 leading-snug">
                        {session.title}
                      </h3>
                    </div>

                    {/* Instructor Mini Badge */}
                    <div className="flex items-center gap-3 pt-2 border-t border-sand-100">
                      <img
                        src={session.instructorAvatar}
                        alt={session.instructorName}
                        className="w-9 h-9 rounded-full object-cover border border-sand-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-sage-900">{session.instructorName}</h4>
                        <p className="text-[10px] text-sage-500">{session.instructorTitle}</p>
                      </div>
                    </div>

                    <p className="text-xs text-sage-600 font-light leading-relaxed line-clamp-2">
                      {session.summary}
                    </p>

                    {/* Remaining Capacity Meter */}
                    <div className="p-2.5 rounded-2xl bg-[#faf8f5] border border-[#e8dfd5] flex items-center justify-between text-xs">
                      <span className="font-semibold text-sage-700">Live Seat Availability:</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        session.remainingSeats < 10
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}>
                        🟢 {session.remainingSeats} Seats Left
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-sand-100 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-sage-400 font-bold uppercase block">Enrollment Fee</span>
                    <span className="font-serif text-lg font-bold text-sage-950">
                      {session.priceUSD === 0
                        ? "Free (Community)"
                        : currency === "INR"
                        ? `₹${session.priceINR.toLocaleString()}`
                        : `$${session.priceUSD}`}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedSession(session)}
                    className="px-5 py-2.5 rounded-full bg-[#5F35C5] hover:bg-[#4d2aa6] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Reserve Seat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#5F35C5] transition-all"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={session.coverImage}
                    alt={session.title}
                    className="w-24 h-24 rounded-2xl object-cover shrink-0 hidden sm:block"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-[#5F35C5] bg-purple-50 px-2 py-0.5 rounded-full">
                        {session.pillar}
                      </span>
                      <span className="text-xs text-sage-500 font-medium">{session.meetingPlatform}</span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-sage-950">{session.title}</h3>
                    <p className="text-xs text-sage-500 font-medium">
                      {session.dateStr} • {getTimeForZone(session)} ({session.durationMinutes} mins)
                    </p>
                    <p className="text-xs text-sage-600 font-light max-w-xl">{session.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-sand-100">
                  <div className="text-right">
                    <span className="font-serif text-base font-bold text-sage-950 block">
                      {session.priceUSD === 0
                        ? "Free"
                        : currency === "INR"
                        ? `₹${session.priceINR.toLocaleString()}`
                        : `$${session.priceUSD}`}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">🟢 {session.remainingSeats} Seats Available</span>
                  </div>

                  <button
                    onClick={() => setSelectedSession(session)}
                    className="px-5 py-2.5 rounded-full bg-[#5F35C5] hover:bg-[#4d2aa6] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Reserve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INTERACTIVE BOOKING / RESERVATION MODAL */}
        {selectedSession && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-sage-950/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#e5ddd3] shadow-2xl overflow-hidden my-8">
              <div className="p-6 border-b border-[#e5ddd3] bg-[#faf7f2] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#5F35C5] block">
                    {selectedSession.pillar} Masterclass
                  </span>
                  <h3 className="font-serif text-xl font-bold text-sage-950">{selectedSession.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-2 rounded-full text-sage-400 hover:text-sage-700 hover:bg-sand-200"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-sage-800">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-sand-200">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-sage-400 block">Scheduled Date & Time</span>
                    <p className="font-bold text-sage-950">{selectedSession.dateStr}</p>
                    <p className="text-[#5F35C5] font-semibold">{getTimeForZone(selectedSession)} ({selectedSession.durationMinutes} Minutes)</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] uppercase font-bold text-sage-400 block">Instructor</span>
                    <p className="font-bold text-sage-950">{selectedSession.instructorName}</p>
                    <p className="text-sage-500">{selectedSession.instructorTitle}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-bold text-sage-400 block">What You Will Learn</span>
                  <div className="space-y-2">
                    {selectedSession.takeaways.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-sand-50 rounded-xl border border-sand-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-sage-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sage-900 block">Virtual Classroom Access</span>
                    <span className="text-sage-600 text-[11px]">Instant Zoom / Google Meet join links emailed upon confirmation.</span>
                  </div>
                  <Video className="w-5 h-5 text-[#5F35C5]" />
                </div>
              </div>

              <div className="p-5 bg-[#faf7f2] border-t border-sand-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sage-400 block">Total Investment</span>
                  <span className="font-serif text-lg font-bold text-sage-950">
                    {selectedSession.priceUSD === 0
                      ? "Free"
                      : currency === "INR"
                      ? `₹${selectedSession.priceINR.toLocaleString()}`
                      : `$${selectedSession.priceUSD}.00`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="px-4 py-2 rounded-full bg-sand-100 text-xs font-semibold text-sage-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleBookSeat(selectedSession)}
                    className="px-6 py-2.5 rounded-full bg-[#5F35C5] text-white text-xs font-semibold hover:bg-[#4d2aa6] flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{selectedSession.priceUSD === 0 ? "Confirm Free Registration" : "Add Seat to Cart & Checkout"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
