"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Package,
  Plus,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  Image as ImageIcon,
  Tag,
  Check,
  Clock,
  Video,
  Utensils,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Stethoscope,
  TrendingUp,
  Award,
  Layers,
  FileText,
  Lock,
  Unlock,
} from "lucide-react";
import { ApiClient } from "@/lib/api/client";
import { Enquiry } from "@/types";

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  product_type: string;
  short_description: string;
  full_description?: string;
  image_url?: string;
  instructor_name?: string;
  instructor_title?: string;
  rating?: number;
  review_count?: number;
  pillar_tag?: string;
  is_active: boolean;
  is_featured: boolean;
  capacity?: number;
  refund_policy_days: number;
  learning_outcomes?: string[];
  prices: Array<{
    currency: string;
    amount_minor: number;
    compare_at_minor?: number;
  }>;
}

interface AdminMember {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  role: string;
  is_active: boolean;
  joined_date: string;
  membership_tier: string;
  enrolled_offerings: string[];
  adherence_score: number;
  nutrition_plan_status: string;
}

interface CalendarSlot {
  id: string;
  date_str: string;
  time_slot: string;
  coach_name: string;
  coach_title: string;
  focus_topic: string;
  total_slots: number;
  booked_count: number;
  status: "available" | "limited" | "booked";
  attendee_name?: string;
  meeting_link: string;
}

export default function AdminPortalPage() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "products" | "members" | "calendar" | "clinical" | "crm" | "metrics"
  >("products");

  // Data states
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Product Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields for New Offering
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formType, setFormType] = useState("single_class");
  const [formShortDesc, setFormShortDesc] = useState("");
  const [formFullDesc, setFormFullDesc] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formInstructor, setFormInstructor] = useState("Dr. Maya Rao");
  const [formInstructorTitle, setFormInstructorTitle] = useState("Lead Lifestyle Physician");
  const [formPillar, setFormPillar] = useState("Nutrition");
  const [formCapacity, setFormCapacity] = useState("30");
  const [formUsdPrice, setFormUsdPrice] = useState("25.00");
  const [formUsdCompare, setFormUsdCompare] = useState("35.00");
  const [formInrPrice, setFormInrPrice] = useState("1999");
  const [formInrCompare, setFormInrCompare] = useState("2999");
  const [formOutcomes, setFormOutcomes] = useState("Evidence-based lifestyle nutrition fundamentals\nPractical zero-oil cooking techniques\nPersonalized health habit tracking");
  const [formApproveLive, setFormApproveLive] = useState(true);
  const [imageUploadTab, setImageUploadTab] = useState<"upload" | "presets" | "url">("upload");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Member Grant Access Modal
  const [selectedMember, setSelectedMember] = useState<AdminMember | null>(null);
  const [grantProductName, setGrantProductName] = useState("Six-Week Lifestyle Reset Cohort");
  const [grantSuccessMsg, setGrantSuccessMsg] = useState<string | null>(null);

  const curatedPresets = [
    { label: "Whole Plant Bowl", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80" },
    { label: "Indian Spiced Dal", url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80" },
    { label: "Sleep & Circadian Setting", url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80" },
    { label: "Mindful Greens & Salad", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" },
    { label: "Physician & Clinical Assessment", url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80" },
    { label: "Active Movement & Habit Coaching", url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80" },
    { label: "Culinary Nutrition Video Lab", url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80" },
    { label: "Organized Meal Prep Containers", url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80" },
  ];

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [prods, mems, slotsData, enqs] = await Promise.all([
        ApiClient.get<AdminProduct[]>("/api/v1/admin/products").catch(() => []),
        ApiClient.get<AdminMember[]>("/api/v1/admin/members").catch(() => []),
        ApiClient.get<CalendarSlot[]>("/api/v1/admin/calendar-slots").catch(() => []),
        ApiClient.get<Enquiry[]>("/api/v1/enquiries").catch(() => []),
      ]);
      setProducts(prods);
      setMembers(mems);
      setSlots(slotsData);
      setEnquiries(enqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleApproval = async (product: AdminProduct) => {
    try {
      const updated = await ApiClient.patch<AdminProduct>(`/api/v1/admin/products/${product.id}`, {
        is_active: !product.is_active,
      });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
    } catch (err) {
      console.error("Failed to toggle approval:", err);
    }
  };

  const handleToggleMemberStatus = async (member: AdminMember) => {
    try {
      await ApiClient.patch(`/api/v1/admin/members/${member.id}/status`, {
        is_active: !member.is_active,
      });
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, is_active: !m.is_active } : m))
      );
    } catch (err) {
      console.error("Failed to update member:", err);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    try {
      await ApiClient.post(`/api/v1/admin/members/${selectedMember.id}/entitlements`, {
        product_id: "prod-granted",
        product_name: grantProductName,
        duration_days: 365,
      });
      setGrantSuccessMsg(`Successfully granted '${grantProductName}' to ${selectedMember.first_name}!`);
      setTimeout(() => {
        setSelectedMember(null);
        setGrantSuccessMsg(null);
      }, 1500);
    } catch (err) {
      console.error("Grant access failed:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadSuccessMsg(null);
    try {
      const res = await ApiClient.uploadFile("/api/v1/admin/upload-image", file);
      setFormImageUrl(res.image_url);
      setUploadSuccessMsg(`Uploaded: ${file.name}`);
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || "Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim() || !formShortDesc.trim()) {
      setModalError("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      const usdMinor = Math.round(parseFloat(formUsdPrice || "0") * 100);
      const usdCompareMinor = formUsdCompare ? Math.round(parseFloat(formUsdCompare) * 100) : undefined;
      const inrMinor = Math.round(parseFloat(formInrPrice || "0") * 100);
      const inrCompareMinor = formInrCompare ? Math.round(parseFloat(formInrCompare) * 100) : undefined;

      const outcomesList = formOutcomes
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await ApiClient.post("/api/v1/admin/products", {
        name: formName.trim(),
        slug: formSlug.trim().toLowerCase(),
        product_type: formType,
        short_description: formShortDesc.trim(),
        full_description: formFullDesc.trim() || undefined,
        image_url: formImageUrl.trim() || undefined,
        instructor_name: formInstructor.trim() || undefined,
        instructor_title: formInstructorTitle.trim() || undefined,
        pillar_tag: formPillar,
        capacity: formCapacity ? parseInt(formCapacity) : undefined,
        usd_amount_minor: usdMinor,
        usd_compare_at_minor: usdCompareMinor,
        inr_amount_minor: inrMinor,
        inr_compare_at_minor: inrCompareMinor,
        learning_outcomes: outcomesList,
        is_active: formApproveLive,
      });

      setIsModalOpen(false);
      resetForm();
      await fetchAdminData();
    } catch (err: any) {
      setModalError(err.message || "Failed to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormSlug("");
    setFormShortDesc("");
    setFormFullDesc("");
    setFormImageUrl("");
    setFormOutcomes("Evidence-based lifestyle nutrition fundamentals\nPractical zero-oil cooking techniques\nPersonalized health habit tracking");
    setFormApproveLive(true);
  };

  const navItems = [
    { id: "products", label: "Offerings & Pricing", icon: Package, badge: `${products.length}` },
    { id: "members", label: "Members & Access", icon: Users, badge: `${members.length}` },
    { id: "calendar", label: "Consultation Calendar", icon: Calendar, badge: `${slots.length}` },
    { id: "clinical", label: "Clinical Approvals", icon: Stethoscope, badge: "Live" },
    { id: "crm", label: "CRM Leads Pipeline", icon: Layers, badge: `${enquiries.length}` },
    { id: "metrics", label: "Platform Analytics", icon: TrendingUp },
  ];

  const formatPrice = (minor?: number, curr = "USD") => {
    if (!minor) return "-";
    if (curr === "INR") return `₹${(minor / 100).toLocaleString()}`;
    return `$${(minor / 100).toFixed(2)}`;
  };

  return (
    <div className="flex h-screen bg-[#faf8f5] text-sage-900 overflow-hidden font-sans">
      {/* 1. Sleek Vertical Left Sidebar matching Member Dashboard */}
      <aside
        className={`bg-[#f4efe8] border-r border-[#e5ddd3] transition-all duration-300 flex flex-col justify-between select-none relative z-30 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="p-4 border-b border-[#e5ddd3]/70 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-[#C35B32] flex items-center justify-center text-white font-serif font-bold text-xl shadow-xs shrink-0">
                अ
              </div>
              {!collapsed && (
                <div className="truncate">
                  <span className="font-serif text-base font-bold text-sage-950 block leading-tight">
                    Annapoorna Admin
                  </span>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#C35B32] block">
                    Operations Control
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-xl text-sage-600 hover:bg-[#e8dfd5] transition-colors cursor-pointer"
              aria-label="Toggle Sidebar"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Action Button */}
          {!collapsed && (
            <div className="p-3 border-b border-[#e5ddd3]/40">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#C35B32] hover:bg-[#4d2aa6] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Offering</span>
              </button>
            </div>
          )}

          {/* Navigation Section */}
          <div className="p-3 space-y-1">
            <span className={`text-[10px] font-bold text-sage-400 uppercase tracking-widest px-3 py-1 block ${collapsed ? "text-center text-[8px]" : ""}`}>
              {collapsed ? "•••" : "Platform Management"}
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-[#C35B32] shadow-xs font-bold"
                      : "text-sage-700 hover:bg-[#eae3d9] hover:text-sage-950"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#C35B32]" : "text-sage-500"}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? "bg-[#C35B32]/10 text-[#C35B32]" : "bg-sand-200 text-sage-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Profile Footer */}
        <div className="p-3 border-t border-[#e5ddd3]">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-white/70 border border-sand-200 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-sage-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
              A
            </div>
            {!collapsed && (
              <div className="truncate flex-1">
                <span className="font-bold text-xs text-sage-950 block truncate">Super Admin</span>
                <span className="text-[10px] text-sage-500 block truncate">admin@annapoorna.local</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace Body with Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Command Bar */}
        <header className="h-16 bg-white border-b border-[#e5ddd3] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-sage-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, members, bookings, or records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 rounded-full bg-[#faf7f2] border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/products"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-sage-600 hover:text-[#C35B32] font-semibold"
            >
              <span>View Public Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/dashboard"
              target="_blank"
              className="px-3.5 py-1.5 rounded-full bg-sand-100 text-sage-800 font-semibold hover:bg-sand-200 transition-colors flex items-center gap-1"
            >
              <span>Member Dashboard</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>

            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Admin Verified
            </span>
          </div>
        </header>

        {/* Scrollable Content View Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* SECTION 1: OFFERINGS & PRICING */}
          {activeSection === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e5ddd3] pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-sage-950">Offerings, Pricing & Store Approvals</h2>
                  <p className="text-xs text-sage-500">Configure multi-currency pricing, upload cover photography, and publish to the store catalogue.</p>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-[#C35B32] hover:bg-[#4d2aa6] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add New Offering
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-3xl border border-[#e5ddd3] shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-sage-800">
                  <thead className="bg-[#faf7f2] text-sage-600 uppercase tracking-wider text-[10px] border-b border-[#e5ddd3]">
                    <tr>
                      <th className="py-4 px-6">Product Offering</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Pillar</th>
                      <th className="py-4 px-6">USD Price</th>
                      <th className="py-4 px-6">INR Price</th>
                      <th className="py-4 px-6">Store Visibility</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e9e1] font-medium">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-sage-500">Loading catalogue...</td>
                      </tr>
                    ) : (
                      products.map((prod) => {
                        const usdPrice = prod.prices.find((p) => p.currency === "USD");
                        const inrPrice = prod.prices.find((p) => p.currency === "INR");
                        return (
                          <tr key={prod.id} className="hover:bg-sand-50/50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-sand-200 overflow-hidden shrink-0 border border-sand-300">
                                  <img
                                    src={prod.image_url || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80"}
                                    alt={prod.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <Link href={`/products/${prod.slug}`} target="_blank" className="font-serif font-bold text-sm text-sage-950 hover:text-[#C35B32] flex items-center gap-1">
                                    {prod.name}
                                    <ExternalLink className="w-3 h-3 text-sage-400" />
                                  </Link>
                                  <p className="text-[11px] text-sage-500 line-clamp-1">{prod.short_description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 uppercase text-[10px] font-bold tracking-wider">{prod.product_type.replace(/_/g, " ")}</td>
                            <td className="py-4 px-6">
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {prod.pillar_tag || "Nutrition"}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-bold">{formatPrice(usdPrice?.amount_minor, "USD")}</td>
                            <td className="py-4 px-6 font-bold">{formatPrice(inrPrice?.amount_minor, "INR")}</td>
                            <td className="py-4 px-6">
                              <button
                                onClick={() => handleToggleApproval(prod)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                  prod.is_active ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                                }`}
                              >
                                {prod.is_active ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Approved & Live</> : <><Clock className="w-3.5 h-3.5 text-amber-700" /> Draft / Pending</>}
                              </button>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <Link href={`/products/${prod.slug}`} target="_blank" className="p-2 text-sage-600 hover:text-[#C35B32]">
                                <Eye className="w-4 h-4" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 2: MEMBER ROSTER & ENTITLEMENTS */}
          {activeSection === "members" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e5ddd3] pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-sage-950">Member Roster, Entitlements & Access Grants</h2>
                  <p className="text-xs text-sage-500">Manage member cohorts, grant scholarship access to programs, and update account states.</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#e5ddd3] shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-sage-800">
                  <thead className="bg-[#faf7f2] text-sage-600 uppercase tracking-wider text-[10px] border-b border-[#e5ddd3]">
                    <tr>
                      <th className="py-4 px-6">Member</th>
                      <th className="py-4 px-6">Membership Tier</th>
                      <th className="py-4 px-6">Enrolled Offerings</th>
                      <th className="py-4 px-6">Adherence Score</th>
                      <th className="py-4 px-6">Account Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e9e1] font-medium">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-sand-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#163B8A] to-[#C35B32] text-white font-bold text-xs flex items-center justify-center">
                              {member.first_name[0]}
                            </div>
                            <div>
                              <span className="font-bold text-sm text-sage-950 block">{member.first_name} {member.last_name || ""}</span>
                              <span className="text-[11px] text-sage-500">{member.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold text-[10px]">
                            {member.membership_tier}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {member.enrolled_offerings.map((off, idx) => (
                              <span key={idx} className="block text-[11px] text-sage-700 bg-sand-100 px-2 py-0.5 rounded-md">
                                {off}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-serif font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            {member.adherence_score}% Score
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleToggleMemberStatus(member)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              member.is_active ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"
                            }`}
                          >
                            {member.is_active ? "Active" : "Suspended"}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => setSelectedMember(member)}
                            className="px-3 py-1.5 rounded-full bg-[#C35B32] text-white font-bold text-[11px] hover:bg-[#4d2aa6]"
                          >
                            Grant Access
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3: CONSULTATION CALENDAR & SLOTS */}
          {activeSection === "calendar" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e5ddd3] pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-sage-950">Consultation Calendar & Time Slots</h2>
                  <p className="text-xs text-sage-500">Live booking slots for 1-on-1 discovery calls, clinical evaluations, and dietitian sessions.</p>
                </div>
                <Link
                  href="/dashboard/appointments"
                  target="_blank"
                  className="px-4 py-2 rounded-full bg-sand-200 text-sage-900 font-bold text-xs flex items-center gap-1.5"
                >
                  <span>Preview Booking Screen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {slots.map((slot) => (
                  <div key={slot.id} className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sage-500">{slot.date_str}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          slot.status === "available"
                            ? "bg-emerald-100 text-emerald-900"
                            : slot.status === "limited"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-rose-100 text-rose-900"
                        }`}
                      >
                        {slot.status === "available" ? "🟢 Available" : slot.status === "limited" ? "🟡 1 Left" : "🔴 Booked"}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-base text-sage-950">{slot.time_slot}</h4>
                    <p className="text-xs text-[#C35B32] font-bold">{slot.focus_topic}</p>
                    <div className="pt-2 border-t border-sand-100 text-xs text-sage-600 space-y-1">
                      <p><strong>Coach:</strong> {slot.coach_name} ({slot.coach_title})</p>
                      <p><strong>Capacity:</strong> {slot.booked_count} of {slot.total_slots} Booked</p>
                      {slot.attendee_name && (
                        <p className="text-emerald-800 font-semibold">Attendee: {slot.attendee_name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: CLINICAL APPROVALS */}
          {activeSection === "clinical" && (
            <div className="space-y-6">
              <div className="border-b border-[#e5ddd3] pb-4">
                <h2 className="font-serif text-2xl font-bold text-sage-950">Clinical Nutrition Plan Approvals</h2>
                <p className="text-xs text-sage-500">Physician sign-off queue for customized 2-stage glycemic meal plans.</p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-emerald-950 block">Priya Sharma • Stage 1 Insulin Sensitization Meal Plan</span>
                    <p className="text-[11px] text-emerald-800">Calorie density target: &lt; 500 kcal/lb • Sprouted mung beans & whole grain rotations</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-950 font-bold text-xs">
                    Approved by Dr. Maya Rao
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-amber-950 block">Kathy Gaither • 40-Min Post-Meal Walking Protocol</span>
                    <p className="text-[11px] text-amber-800">CGM flatline goal: 98 mg/dL target • Hydration with electrolytes</p>
                  </div>
                  <button className="px-4 py-1.5 rounded-full bg-[#C35B32] text-white font-bold text-xs hover:bg-[#4d2aa6]">
                    Sign & Approve
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: CRM INBOUND LEADS */}
          {activeSection === "crm" && (
            <div className="space-y-6">
              <div className="border-b border-[#e5ddd3] pb-4">
                <h2 className="font-serif text-2xl font-bold text-sage-950">CRM Inbound Leads & Pipeline</h2>
                <p className="text-xs text-sage-600">Track contact requests, starter guide downloads, and coaching discovery calls.</p>
              </div>

              <div className="bg-white rounded-3xl border border-[#e5ddd3] shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-sage-800">
                  <thead className="bg-[#faf7f2] text-sage-600 uppercase tracking-wider text-[10px] border-b border-[#e5ddd3]">
                    <tr>
                      <th className="py-4 px-6">Lead Name</th>
                      <th className="py-4 px-6">Email</th>
                      <th className="py-4 px-6">Interested Offering</th>
                      <th className="py-4 px-6">Stage</th>
                      <th className="py-4 px-6">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e9e1] font-medium">
                    {enquiries.map((enq) => (
                      <tr key={enq.id} className="hover:bg-sand-50/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-sage-950">{enq.first_name} {enq.last_name || ""}</td>
                        <td className="py-4 px-6 text-sage-600">{enq.email}</td>
                        <td className="py-4 px-6 font-semibold text-sage-900">{enq.interested_product || "Lifestyle Medicine Program"}</td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px]">
                            {enq.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sage-500">{new Date(enq.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 6: PLATFORM METRICS */}
          {activeSection === "metrics" && (
            <div className="space-y-6">
              <div className="border-b border-[#e5ddd3] pb-4">
                <h2 className="font-serif text-2xl font-bold text-sage-950">Platform Health & Analytics</h2>
                <p className="text-xs text-sage-500">Gross revenue, active subscription retention, and cohort completion rates.</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-xs space-y-1">
                  <span className="text-xs text-sage-500 font-semibold">Active Members</span>
                  <span className="font-serif text-3xl font-bold text-sage-900 block">{members.length || 1420}</span>
                  <span className="text-[11px] text-emerald-700 font-medium">+14% this month</span>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-xs space-y-1">
                  <span className="text-xs text-sage-500 font-semibold">Scheduled Sessions</span>
                  <span className="font-serif text-3xl font-bold text-sage-900 block">{slots.length}</span>
                  <span className="text-[11px] text-sage-600 font-medium">85% Capacity booked</span>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-xs space-y-1">
                  <span className="text-xs text-sage-500 font-semibold">Inbound Leads</span>
                  <span className="font-serif text-3xl font-bold text-[#C35B32] block">{enquiries.length || 20}</span>
                  <span className="text-[11px] text-amber-700 font-medium">5 Require Follow-up</span>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-sand-200 shadow-xs space-y-1">
                  <span className="text-xs text-sage-500 font-semibold">Gross Platform Revenue</span>
                  <span className="font-serif text-3xl font-bold text-emerald-900 block">₹8,45,000</span>
                  <span className="text-[11px] text-emerald-700 font-medium">Multi-currency verified</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: CREATE OFFERING */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-sage-950/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-[#e5ddd3] shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-[#e5ddd3] bg-[#faf7f2] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-sage-950">Add New Wellness Offering</h3>
                <p className="text-xs text-sage-500">Configure details, multi-currency prices, cover photo, and approve for store.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full text-sage-400 hover:text-sage-700 hover:bg-sand-200">
                ✕
              </button>
            </div>

            {modalError && (
              <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">{modalError}</div>
            )}

            <form onSubmit={handleCreateProduct} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-800">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gut Microbiome Masterclass"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (!formSlug) setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-800">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-800">Offering Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                  >
                    <option value="single_class">Live Cooking Class</option>
                    <option value="workshop">Wellness Workshop</option>
                    <option value="program">Multi-Week Program</option>
                    <option value="consultation">1-on-1 Consultation</option>
                    <option value="coaching_package">Coaching Package</option>
                    <option value="course">Video Course</option>
                    <option value="meal_plan_package">Meal Plan & Guide</option>
                    <option value="membership_monthly">Monthly Membership</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-800">Lifestyle Pillar</label>
                  <select
                    value={formPillar}
                    onChange={(e) => setFormPillar(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                  >
                    <option value="Nutrition">Nutrition</option>
                    <option value="Movement">Movement</option>
                    <option value="Restorative Sleep">Restorative Sleep</option>
                    <option value="Mindfulness">Mindfulness</option>
                    <option value="Community">Community</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-800">Max Capacity / Seats</label>
                  <input
                    type="number"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e8dfd5] space-y-3">
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#C35B32] block">
                  Authoritative Pricing Configuration
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-sage-800">USD Price ($)</label>
                    <input
                      type="text"
                      placeholder="25.00"
                      value={formUsdPrice}
                      onChange={(e) => setFormUsdPrice(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-white border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-sage-800">USD Compare ($)</label>
                    <input
                      type="text"
                      placeholder="35.00"
                      value={formUsdCompare}
                      onChange={(e) => setFormUsdCompare(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-white border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-sage-800">INR Price (₹)</label>
                    <input
                      type="text"
                      placeholder="1999"
                      value={formInrPrice}
                      onChange={(e) => setFormInrPrice(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-white border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-sage-800">INR Compare (₹)</label>
                    <input
                      type="text"
                      placeholder="2999"
                      value={formInrCompare}
                      onChange={(e) => setFormInrCompare(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-white border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Image Upload & Media Selection */}
              <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e8dfd5] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#C35B32]">
                    Cover Photography & Media *
                  </span>
                  <div className="flex items-center bg-sand-200/70 p-0.5 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageUploadTab("upload")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        imageUploadTab === "upload" ? "bg-white shadow-xs text-sage-900" : "text-sage-600 hover:text-sage-900"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadTab("presets")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        imageUploadTab === "presets" ? "bg-white shadow-xs text-sage-900" : "text-sage-600 hover:text-sage-900"
                      }`}
                    >
                      Wellness Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadTab("url")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        imageUploadTab === "url" ? "bg-white shadow-xs text-sage-900" : "text-sage-600 hover:text-sage-900"
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                </div>

                {imageUploadTab === "upload" && (
                  <div className="border-2 border-dashed border-sand-300 rounded-2xl p-6 text-center space-y-2 bg-white hover:border-[#C35B32] transition-colors">
                    <ImageIcon className="w-8 h-8 text-sage-400 mx-auto" />
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold text-[#C35B32] hover:underline cursor-pointer">
                        <span>Click to select an image from your computer</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-sage-500">Supports PNG, JPG, WebP, AVIF up to 10MB</p>
                    </div>
                    {isUploadingImage && <p className="text-xs font-semibold text-[#C35B32] animate-pulse">Uploading image...</p>}
                    {uploadSuccessMsg && <p className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {uploadSuccessMsg}</p>}
                  </div>
                )}

                {imageUploadTab === "presets" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {curatedPresets.map((preset) => (
                      <div
                        key={preset.label}
                        onClick={() => setFormImageUrl(preset.url)}
                        className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                          formImageUrl === preset.url ? "border-[#C35B32] ring-2 ring-[#C35B32]/30" : "border-transparent hover:opacity-90"
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                          <span className="text-[9px] font-bold text-white leading-tight drop-shadow-sm">{preset.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {imageUploadTab === "url" && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-sage-800">Direct CDN / Web Image URL</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl bg-white border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                    />
                  </div>
                )}

                {formImageUrl && (
                  <div className="relative h-36 rounded-2xl overflow-hidden bg-sand-200 border border-sand-300 group">
                    <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">Selected Cover</span>
                      <button
                        type="button"
                        onClick={() => { setFormImageUrl(""); setUploadSuccessMsg(null); }}
                        className="px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[10px] font-semibold hover:bg-rose-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-sage-800">Short Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                />
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-emerald-950 block">Approve & Publish Immediately to Store</span>
                  <span className="text-[11px] text-emerald-800">Visible in public Store Catalogue and Calendar.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formApproveLive}
                  onChange={(e) => setFormApproveLive(e.target.checked)}
                  className="w-5 h-5 text-[#C35B32] rounded-md focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-sand-100 hover:bg-sand-200 text-sage-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#C35B32] hover:bg-[#4d2aa6] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save & Publish Offering"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GRANT MEMBER ACCESS */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-sage-950/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#e5ddd3] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#e5ddd3] bg-[#faf7f2] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-sage-950">Grant Manual Offering Access</h3>
                <p className="text-xs text-sage-500">Member: {selectedMember.first_name} ({selectedMember.email})</p>
              </div>
              <button onClick={() => setSelectedMember(null)} className="p-2 text-sage-400 hover:text-sage-700">✕</button>
            </div>

            {grantSuccessMsg ? (
              <div className="p-6 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                {grantSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleGrantAccess} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-800">Select Offering to Grant</label>
                  <select
                    value={grantProductName}
                    onChange={(e) => setGrantProductName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                  >
                    <option value="Six-Week Lifestyle Reset Cohort">Six-Week Lifestyle Reset Cohort</option>
                    <option value="Plant-Based Foundations Class">Plant-Based Foundations Class</option>
                    <option value="Indian Whole-Food Cooking Workshop">Indian Whole-Food Cooking Workshop</option>
                    <option value="1-on-1 Nutrition Consultation">1-on-1 Nutrition Consultation</option>
                    <option value="Science of Whole Food Nutrition Course">Science of Whole Food Nutrition Course</option>
                    <option value="VIP Annual Membership">VIP Annual Membership</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-200">
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="px-4 py-2 rounded-full bg-sand-100 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#C35B32] text-white text-xs font-semibold hover:bg-[#4d2aa6]"
                  >
                    Grant Access
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
