"use client";

import React, { useState } from "react";
import {
  FileDown,
  Download,
  BookOpen,
  FileText,
  CheckCircle2,
  Eye,
  Sparkles,
  ExternalLink,
  Printer,
} from "lucide-react";

export default function MyResourcesPage() {
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const resources = [
    {
      id: "res-1",
      title: "Complete Plant-Based Starter Handbook & Pantry Blueprint",
      fileType: "PDF Clinical Guide (42 Pages)",
      size: "8.4 MB",
      category: "Pantry & Nutrition",
      summary: "Everything you need to set up a whole food kitchen: oil-free sautéing, whole grain batch cooking, spice pairing matrix, and 14-day starter meal templates.",
      chapters: [
        "1. Setting up the Zero-Oil Pantry & Essential Spices",
        "2. Soaking & Sprouting Legumes for Maximum Bioavailability",
        "3. Batch Cooking Intact Grains & Legumes",
        "4. Delicious Oil-Free Salad Dressings & Sauces",
        "5. Two-Week Kickstart Grocery List & Meal Matrix",
      ],
    },
    {
      id: "res-2",
      title: "50 Essential Ayurvedic Anti-Inflammatory Recipes",
      fileType: "E-Book Edition (120 Pages)",
      size: "14.2 MB",
      category: "Culinary Medicine",
      summary: "Curated collection of clinical lifestyle recipes utilizing therapeutic spices (turmeric, ginger, cumin, coriander, fenugreek, and cardamom).",
      chapters: [
        "1. Principles of Ayurvedic Agni (Digestive Fire)",
        "2. Breakfast Bowls & Morning Porridges",
        "3. Healing Dals, Kadhis & Vegetable Curries",
        "4. Fiber-Rich Breads & Grain Pilafs",
        "5. Evening Digestive Teas & Golden Elixirs",
      ],
    },
    {
      id: "res-3",
      title: "Circadian Sleep Hygiene & Evening Down-Regulation Checklist",
      fileType: "Printable Tracker (4 Pages)",
      size: "1.8 MB",
      category: "Restorative Sleep",
      summary: "Evidence-based sleep optimization protocol: blue-light curfew, magnesium-rich evening meals, bedroom temperature regulation, and 4-7-8 breathing exercises.",
      chapters: [
        "1. The 90-Minute Digital Sunset Routine",
        "2. Temperature & Melatonin Synchronization",
        "3. Evening Herb Infusions & Magnesium Foods",
        "4. 30-Day Sleep Quality Journal Sheet",
      ],
    },
    {
      id: "res-4",
      title: "Glycemic Index & Satiety Peptide Pocket Reference",
      fileType: "Quick-Reference Card (2 Pages)",
      size: "950 KB",
      category: "Metabolic Biomarkers",
      summary: "Laminated reference guide for identifying low-glycemic load legumes, non-starchy vegetables, and high-polyphenol whole fruits.",
      chapters: [
        "1. Low-GI vs High-GI Whole Food Chart",
        "2. The 30-Chew Satiety Protocol",
        "3. Postprandial Walking Time Curves",
      ],
    },
  ];

  const handleDownload = (res: any) => {
    setDownloadToast(`Preparing "${res.title}" for download...`);

    const docContent = `# ${res.title.toUpperCase()}
Category: ${res.category}
Format: ${res.fileType}
Published by: Annapoorna Lifestyle Medicine Inc.
=============================================================

EXECUTIVE SUMMARY:
${res.summary}

CHAPTER OUTLINE & PROTOCOLS:
${res.chapters.map((c: string) => `* ${c}`).join("\n")}

=============================================================
CLINICAL INSTRUCTIONS:
1. Review the pantry setup matrix and discard refined oils.
2. Follow the 14-day whole-plant rotational meal guidelines.
3. Track daily adherence inside your Annapoorna Member Workspace.

Annapoorna Portal • https://annapoorna.local
=============================================================`;

    const blob = new Blob([docContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${res.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadToast(`✓ "${res.title}" saved to your Downloads!`);
      setTimeout(() => setDownloadToast(null), 4000);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#C35B32] bg-[#C35B32]/10 px-2.5 py-0.5 rounded-full">
          Digital Library & Downloads
        </span>
        <h1 className="font-serif text-3xl font-bold text-sage-950 mt-1">
          My Downloadable Resources & Clinical Guides
        </h1>
        <p className="text-xs text-sage-600">
          Lifetime access to your purchased e-books, checklists, meal planning templates, and handbooks.
        </p>
      </div>

      {downloadToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-900 flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      <div className="space-y-4">
        {resources.map((res) => (
          <div
            key={res.id}
            className="bg-white p-6 rounded-3xl border border-[#e5ddd3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#C35B32] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sand-100 border border-sand-200 flex items-center justify-center text-[#C35B32] shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#C35B32]">{res.category}</span>
                <h4 className="font-serif text-base font-bold text-sage-900">{res.title}</h4>
                <p className="text-xs text-sage-500">{res.fileType} • {res.size}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSelectedResource(res)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-sand-100 hover:bg-sand-200 text-sage-800 text-xs font-semibold border border-sand-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <button
                onClick={() => handleDownload(res)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-[#C35B32] hover:bg-[#4d2aa6] text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RESOURCE PREVIEW MODAL */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-sage-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#e5ddd3] shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-[#e5ddd3] bg-[#faf7f2] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C35B32] block">{selectedResource.category}</span>
                <h3 className="font-serif text-xl font-bold text-sage-950">{selectedResource.title}</h3>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-2 rounded-full text-sage-400 hover:text-sage-700 hover:bg-sand-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-sage-800">
              <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200 space-y-1">
                <span className="font-bold text-sage-900 block text-[11px]">Executive Summary:</span>
                <p className="leading-relaxed text-sage-700">{selectedResource.summary}</p>
              </div>

              <div className="space-y-3">
                <span className="font-bold text-sage-900 block text-[11px] uppercase tracking-wider text-sage-400">
                  Table of Contents & Key Sections:
                </span>
                <div className="space-y-2">
                  {selectedResource.chapters.map((ch: string, idx: number) => (
                    <div key={idx} className="p-3 bg-white border border-sand-200 rounded-xl flex items-center justify-between text-xs font-semibold text-sage-800">
                      <span>{ch}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#faf7f2] border-t border-sand-200 flex items-center justify-between">
              <span className="text-xs text-sage-500">{selectedResource.fileType} • {selectedResource.size}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedResource(null)}
                  className="px-4 py-2 rounded-full bg-sand-100 text-xs font-semibold text-sage-700"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownload(selectedResource);
                    setSelectedResource(null);
                  }}
                  className="px-5 py-2 rounded-full bg-[#C35B32] text-white text-xs font-semibold hover:bg-[#4d2aa6] flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Save Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
