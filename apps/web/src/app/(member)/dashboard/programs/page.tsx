"use client";

import React from "react";
import Link from "next/link";
import { Compass, Calendar, CheckCircle2, ArrowRight, BookOpen, Clock, Users } from "lucide-react";

export default function MyProgramsPage() {
  const programs = [
    {
      id: "prog-1",
      title: "Six-Week Lifestyle Medicine Reset Cohort",
      slug: "six-week-lifestyle-reset",
      leadDoctor: "Dr. Maya Rao",
      currentWeek: 3,
      totalWeeks: 6,
      progressPercent: 50,
      nextCohortCall: "Thursday at 7:00 PM IST",
      pillarsCovered: ["Nutrition", "Movement", "Restorative Sleep", "Mindfulness"],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">
            Multi-Pillar Transformation
          </span>
          <h1 className="font-serif text-3xl font-bold text-sage-950 mt-1">
            My Enrolled Programs & Cohorts
          </h1>
          <p className="text-xs text-sage-600">
            Structured lifestyle medicine curriculum, weekly group masterclasses, and peer accountability circles.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {programs.map((prog) => (
          <div
            key={prog.id}
            className="bg-white p-8 rounded-3xl border border-[#e5ddd3] shadow-xs space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-annapoorna-700 bg-sand-100 px-3 py-1 rounded-full">
                  Cohort Active • Week {prog.currentWeek} of {prog.totalWeeks}
                </span>
                <h3 className="font-serif text-2xl font-bold text-sage-900 mt-2">{prog.title}</h3>
                <p className="text-xs text-sage-500">Lead Faculty: {prog.leadDoctor}</p>
              </div>

              <div className="text-right space-y-1">
                <span className="text-xs font-bold text-sage-700">Overall Progress: {prog.progressPercent}%</span>
                <div className="w-48 h-2.5 bg-sand-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${prog.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-sand-100 text-xs text-sage-700">
              <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e8dfd5] space-y-1">
                <span className="text-[10px] uppercase font-bold text-sage-400">Next Live Call</span>
                <p className="font-bold text-sage-900">{prog.nextCohortCall}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e8dfd5] space-y-1">
                <span className="text-[10px] uppercase font-bold text-sage-400">Pillars In Focus</span>
                <p className="font-bold text-sage-900">{prog.pillarsCovered.join(", ")}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e8dfd5] space-y-1">
                <span className="text-[10px] uppercase font-bold text-sage-400">Community Circle</span>
                <p className="font-bold text-emerald-800">42 Members Active</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <a
                href="https://meet.annapoorna.wellness/cohort-room"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 rounded-full bg-annapoorna-600 hover:bg-annapoorna-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
              >
                Join Weekly Cohort Call <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
