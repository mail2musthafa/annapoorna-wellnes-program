"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Video, Download, ArrowLeft, CheckCircle, ExternalLink } from "lucide-react";
import { ApiClient } from "@/lib/api/client";

export default function MyClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch member's classes or seeded classes
    ApiClient.get<any[]>("/api/v1/live-classes")
      .then((res) => setClasses(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-12 sm:py-16 bg-sand-50 min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-sand-200 pb-4">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage-600 hover:text-annapoorna-600">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-annapoorna-600">My Live Schedule</span>
        </div>

        <div>
          <h1 className="font-serif text-3xl font-bold text-sage-900">Enrolled Live Classes & Workshops</h1>
          <p className="text-xs text-sage-600 mt-1">Access your confirmed workshop links, recipes, and session recordings.</p>
        </div>

        {/* Classes List */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-sand-200 p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold">
                  Confirmed Seat #1
                </span>
                <span className="text-xs text-sage-500 font-medium">Tomorrow at 9:00 AM IST</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-sage-900">
                Morning Pranayama & Breathwork Flow
              </h3>
              <p className="text-xs text-sage-600 leading-relaxed">
                Led by Kavita Nair. 60-minute interactive live workshop focusing on morning vagus nerve down-regulation and mindful energy.
              </p>
              <div className="flex items-center gap-4 text-xs text-sage-500 pt-1">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 60 Mins</span>
                <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Class Preparation PDF</span>
              </div>
            </div>

            <div className="space-y-3 w-full md:w-auto text-center md:text-right">
              <a
                href="https://meet.annapoorna.wellness/live-room"
                target="_blank"
                rel="noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-annapoorna-600 hover:bg-annapoorna-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                <Video className="w-4 h-4" />
                Join Live Workshop
              </a>
              <span className="block text-[10px] text-sage-500">Link active 15 mins before start</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-sand-200 p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 opacity-90">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-sand-200 text-sage-800 rounded-full text-xs font-bold">
                  Recording Available
                </span>
                <span className="text-xs text-sage-500 font-medium">Completed on Aug 15</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-sage-900">
                Ayurvedic Anti-Inflammatory Cooking
              </h3>
              <p className="text-xs text-sage-600 leading-relaxed">
                Led by Shobha Swamy. Full recording of the 75-minute whole-food cooking masterclass with downloadable recipe card.
              </p>
            </div>

            <div>
              <a
                href="#recording"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-sand-100 hover:bg-sand-200 text-sage-800 font-semibold text-xs transition-all border border-sand-300"
              >
                Watch Recording <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
