"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Gem,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  CreditCard,
  Headphones,
  Check,
  AlertCircle,
} from "lucide-react";

export default function MyMembershipPage() {
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportNotice, setSupportNotice] = useState<string | null>(null);
  const [billingFrequency, setBillingFrequency] = useState<"monthly" | "annual">("monthly");
  const [billingToast, setBillingToast] = useState<string | null>(null);

  const handleUpdateBilling = (e: React.FormEvent) => {
    e.preventDefault();
    setBillingToast(`✓ Billing updated to ${billingFrequency === "annual" ? "Annual ($249/yr with 2 Months Free)" : "Monthly ($29/mo)"}!`);
    setTimeout(() => {
      setIsBillingModalOpen(false);
      setTimeout(() => setBillingToast(null), 3000);
    }, 1200);
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportNotice("VIP Concierge ticket #VIP-8941 dispatched to Dr. Maya Rao & Care Team.");
    setTimeout(() => {
      setIsSupportModalOpen(false);
      setSupportMessage("");
      setSupportNotice(null);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#C35B32] bg-[#C35B32]/10 px-2.5 py-0.5 rounded-full">
          Recurring Plan & VIP Status
        </span>
        <h1 className="font-serif text-3xl font-bold text-sage-950 mt-1">
          Annapoorna VIP Membership
        </h1>
        <p className="text-xs text-sage-600">
          All-access holistic wellness pass, weekly live masterclasses, culinary archives, and priority clinical support.
        </p>
      </div>

      {billingToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-900 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{billingToast}</span>
        </div>
      )}

      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-sand-100">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold">
              <Gem className="w-3.5 h-3.5 text-emerald-700" /> Active VIP Membership
            </div>
            <h3 className="font-serif text-2xl font-bold text-sage-900">
              Annapoorna {billingFrequency === "annual" ? "Annual All-Access Pass" : "Monthly Wellness Pass"}
            </h3>
            <p className="text-xs text-sage-500">
              Next renewal on Sep 22, 2026 • {billingFrequency === "annual" ? "$249.00 / ₹19,999 (Billed Yearly)" : "$29.00 / ₹2,299 (Billed Monthly)"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="px-4 py-2.5 rounded-full bg-sand-100 hover:bg-sand-200 text-sage-800 text-xs font-semibold border border-sand-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5 text-[#C35B32]" />
              <span>VIP Concierge</span>
            </button>

            <button
              onClick={() => setIsBillingModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#C35B32] hover:bg-[#4d2aa6] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Manage Billing</span>
            </button>
          </div>
        </div>

        {/* Benefits Checklist */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-bold text-sage-900">Your Included Membership Privileges:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-sage-700">
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-[#faf7f2] border border-[#e8dfd5]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sage-950 block">Unlimited Weekly Live Classes</strong>
                <span>Join any live cooking lab or workshop with interactive Q&A.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-[#faf7f2] border border-[#e8dfd5]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sage-950 block">100+ Masterclass Video Archive</strong>
                <span>Instant on-demand access to all recorded culinary and medical lectures.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-[#faf7f2] border border-[#e8dfd5]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sage-950 block">Weekly Clinical Meal Plans</strong>
                <span>Automated anti-inflammatory meal templates with smart shopping lists.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-[#faf7f2] border border-[#e8dfd5]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sage-950 block">Priority Faculty Office Hours</strong>
                <span>Direct group consultation slots with Dr. Maya Rao & certified health coaches.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: MANAGE BILLING */}
      {isBillingModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-sage-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#e5ddd3] shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-[#e5ddd3] bg-[#faf7f2] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-sage-950">Membership & Billing Options</h3>
                <p className="text-xs text-sage-500">Card ending in 4242 • Powered by Stripe</p>
              </div>
              <button onClick={() => setIsBillingModalOpen(false)} className="p-2 text-sage-400 hover:text-sage-700">✕</button>
            </div>

            <form onSubmit={handleUpdateBilling} className="p-6 space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-sage-800 block">Select Billing Plan:</label>
                <div
                  onClick={() => setBillingFrequency("monthly")}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    billingFrequency === "monthly" ? "border-[#C35B32] bg-purple-50/50" : "border-sand-200 hover:bg-sand-50"
                  }`}
                >
                  <div>
                    <span className="font-bold text-sage-900 block">Monthly Billing</span>
                    <span className="text-sage-500">$29.00 / month (or ₹2,299)</span>
                  </div>
                  {billingFrequency === "monthly" && <CheckCircle2 className="w-4 h-4 text-[#C35B32]" />}
                </div>

                <div
                  onClick={() => setBillingFrequency("annual")}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    billingFrequency === "annual" ? "border-[#C35B32] bg-purple-50/50" : "border-sand-200 hover:bg-sand-50"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sage-900">Annual Billing</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[9px]">Save 28%</span>
                    </div>
                    <span className="text-sage-500">$249.00 / year (2 Months Free!)</span>
                  </div>
                  {billingFrequency === "annual" && <CheckCircle2 className="w-4 h-4 text-[#C35B32]" />}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-200">
                <button
                  type="button"
                  onClick={() => setIsBillingModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-sand-100 text-xs font-semibold text-sage-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#C35B32] text-white text-xs font-semibold hover:bg-[#4d2aa6]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIP CONCIERGE CHAT */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-sage-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#e5ddd3] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[#e5ddd3] bg-[#faf7f2] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-sage-950">VIP Member Concierge</h3>
                <p className="text-xs text-sage-500">Direct line to Clinical Nutrition & Technical Staff</p>
              </div>
              <button onClick={() => setIsSupportModalOpen(false)} className="p-2 text-sage-400 hover:text-sage-700">✕</button>
            </div>

            {supportNotice ? (
              <div className="p-8 text-center text-xs font-semibold text-emerald-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p>{supportNotice}</p>
              </div>
            ) : (
              <form onSubmit={handleSendSupport} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-sage-800">How can our faculty assist you today?</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. Question regarding recipe ingredient substitution, lab result interpretation, or class schedule..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    className="w-full text-xs p-3 rounded-2xl border border-sand-300 focus:outline-none focus:ring-1 focus:ring-[#C35B32]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-sand-200">
                  <button
                    type="button"
                    onClick={() => setIsSupportModalOpen(false)}
                    className="px-4 py-2 rounded-full bg-sand-100 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#C35B32] text-white text-xs font-semibold hover:bg-[#4d2aa6]"
                  >
                    Send to Concierge
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
