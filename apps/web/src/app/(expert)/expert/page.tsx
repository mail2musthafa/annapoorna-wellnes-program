"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Users, CheckCircle, Clock, FileText, ArrowRight, MessageSquare } from "lucide-react";
import { ApiClient } from "@/lib/api/client";

export default function ExpertWorkspacePage() {
  const [assignedMembers, setAssignedMembers] = useState([
    {
      id: "mem-1",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      goal: "Metabolic Reset & Blood Sugar Harmony",
      planStatus: "Approved",
      lastCheckIn: "Today",
    },
    {
      id: "mem-2",
      name: "Rahul Verma",
      email: "rahul.verma@example.com",
      goal: "Circadian Sleep & Anti-Inflammatory Nutrition",
      planStatus: "Awaiting Expert Review",
      lastCheckIn: "Yesterday",
    },
    {
      id: "mem-3",
      name: "Aisha Khan",
      email: "aisha.khan@example.com",
      goal: "Plant-Based Transition for Gut Microbiome",
      planStatus: "Approved",
      lastCheckIn: "2 days ago",
    },
  ]);

  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const handleApprovePlan = (memberId: string) => {
    setAssignedMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, planStatus: "Approved" } : m))
    );
    setReviewingId(null);
  };

  return (
    <div className="py-12 sm:py-16 bg-sand-50 min-h-[85vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-sand-200 shadow-sm">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-800">
              Qualified Practitioner Workspace
            </span>
            <h1 className="font-serif text-3xl font-bold text-sage-900 mt-1">
              Expert Clinical & Coaching Portal
            </h1>
            <p className="text-xs text-sage-600">
              Manage strictly assigned members, review draft nutrition plans, and conduct consultations.
            </p>
          </div>
          <span className="px-4 py-2 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-700" />
            Verified Practitioner
          </span>
        </div>

        {/* Assigned Members Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-sage-900">
              Assigned Member Rosters ({assignedMembers.length})
            </h3>
            <span className="text-xs text-sage-500 font-medium">Access governed strictly by assignment</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assignedMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white p-6 rounded-3xl border border-sand-200 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        member.planStatus === "Approved"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-amber-100 text-amber-900 animate-pulse"
                      }`}
                    >
                      {member.planStatus}
                    </span>
                    <span className="text-[10px] text-sage-400">Active</span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-sage-900">{member.name}</h4>
                  <p className="text-xs text-sage-600">{member.email}</p>
                  <p className="text-xs text-sage-700 bg-sand-50 p-2.5 rounded-xl border border-sand-200">
                    <strong>Goal:</strong> {member.goal}
                  </p>
                </div>

                <div className="pt-2 border-t border-sand-100 space-y-2">
                  {member.planStatus === "Awaiting Expert Review" ? (
                    <button
                      onClick={() => handleApprovePlan(member.id)}
                      className="w-full py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve & Publish Plan
                    </button>
                  ) : (
                    <Link
                      href="/dashboard/nutrition-plan"
                      className="w-full py-2 rounded-full bg-sand-100 hover:bg-sand-200 text-sage-800 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Active Plan
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
