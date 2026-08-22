"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Utensils,
  Stethoscope,
  Compass,
  GraduationCap,
  Gem,
  FileDown,
  Receipt,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Search,
  Bell,
  User,
  ExternalLink,
  Plus,
  Radio,
  MessageSquare,
  Video,
  BookOpen,
  Activity,
  HelpCircle,
  MessageCircle,
} from "lucide-react";

export default function DashboardSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState("member@annapoorna.local");
  const [userName, setUserName] = useState("Priya Sharma");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("annapoorna_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setUserEmail(u.email || "member@annapoorna.local");
          setUserName(u.first_name ? `${u.first_name} ${u.last_name || ""}` : "Priya Sharma");
        } catch (e) {}
      }
    }
  }, []);

  const programNav = [
    { label: "Community Forum", href: "/dashboard/community", icon: MessageSquare, badge: "Feed" },
    { label: "Events & Calendar", href: "/dashboard/classes", icon: Calendar, badge: "Live" },
    { label: "Live Office Hours", href: "/dashboard/appointments", icon: Video },
    { label: "Online Course (Protocol™)", href: "/dashboard/courses", icon: BookOpen },
    { label: "6-Weeks Reset Meal Plans", href: "/dashboard/nutrition-plan", icon: Utensils, badge: "Approved" },
    { label: "Bonus Recipes & Tutorials", href: "/dashboard", icon: Sparkles },
    { label: "Workout Collection", href: "/dashboard/programs", icon: Activity },
    { label: "Resources & Guides", href: "/dashboard/resources", icon: FileDown },
    { label: "VIP Membership", href: "/dashboard/membership", icon: Gem },
    { label: "Invoices & Purchases", href: "/dashboard/purchases", icon: Receipt },
  ];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("annapoorna_token");
      localStorage.removeItem("annapoorna_user");
      router.push("/login");
    }
  };

  return (
    <div className="flex h-screen bg-[#faf8f5] text-sage-900 overflow-hidden font-sans">
      {/* Sleek Mastering Diabetes University / Incorvo Style Left Sidebar */}
      <aside
        className={`bg-[#f4efe8] border-r border-[#e5ddd3] transition-all duration-300 flex flex-col justify-between select-none relative z-30 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Brand / Logo Section */}
        <div className="p-4 border-b border-[#e5ddd3]/70 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-[#163B8A] flex items-center justify-center text-white font-serif font-bold text-xl shadow-xs shrink-0">
              अ
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-serif text-base font-bold text-sage-950 block leading-tight">
                  Annapoorna Portal
                </span>
                <span className="text-[9px] uppercase tracking-widest font-semibold text-[#5F35C5] block">
                  Lifestyle University
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl text-sage-600 hover:bg-[#e8dfd5] transition-colors"
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action + Create Button */}
        {!collapsed && (
          <div className="p-3 border-b border-[#e5ddd3]/40">
            <button
              onClick={() => router.push("/classes")}
              className="w-full py-2 px-3.5 rounded-xl bg-white border border-[#ded5c7] text-sage-900 hover:border-annapoorna-500 font-semibold text-xs shadow-xs flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 text-annapoorna-600" />
              <span>Book Class / Consult</span>
            </button>
          </div>
        )}

        {/* Navigation Items with Accordion Group */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {!collapsed && (
            <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-sage-600 uppercase tracking-wider">
              <span>The Annapoorna Program</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          )}

          {programNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-[#5F35C5] text-white shadow-xs"
                    : "text-sage-700 hover:bg-white/70 hover:text-sage-950"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-sage-500"
                  }`}
                />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ml-1.5 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-[#e5ddd3]/80 bg-[#ede5db]/50 space-y-2">
          {!collapsed ? (
            <div className="p-2 rounded-xl bg-white/80 border border-[#e2d8cb] flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#163B8A] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {userName[0]}
                </div>
                <div className="truncate">
                  <span className="font-bold text-xs text-sage-950 block truncate">{userName}</span>
                  <span className="text-[10px] text-sage-500 block truncate">{userEmail}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xl text-sage-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2 rounded-xl text-sage-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#e5ddd3] bg-white/95 backdrop-blur-md px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <div className="relative max-w-xs hidden sm:block">
              <Search className="w-3.5 h-3.5 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search classes, recipes, tutorials..."
                className="pl-8 pr-4 py-1.5 text-xs rounded-full bg-[#f6f2ed] border border-[#e5ddd3] focus:outline-none focus:ring-1 focus:ring-[#5F35C5] w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Class Notice Chip */}
            <Link
              href="/dashboard/classes"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Office Hours in 14h
            </Link>

            <Link
              href="/classes"
              className="text-xs font-semibold text-sage-600 hover:text-annapoorna-600 flex items-center gap-1"
            >
              Public Store <ExternalLink className="w-3 h-3" />
            </Link>

            <button className="p-2 rounded-full text-sage-600 hover:bg-sand-100 relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
