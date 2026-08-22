"use client";

import { useState } from "react";
import { BookOpen, CheckCircle, Download, Sparkles } from "lucide-react";
import { ApiClient } from "@/lib/api/client";

export default function LeadGuidePage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.post<{ status: string; download_url?: string }>("/api/v1/leads/capture", {
        email,
        first_name: firstName,
        magnet_slug: "6-pillars-starter-guide",
      });
      setDownloadUrl(res.download_url || "https://storage.annapoorna.wellness/guides/6-pillars-starter-guide.pdf");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 bg-gradient-to-b from-sand-100/50 to-sand-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-sand-200 p-8 sm:p-12 shadow-sm">
          <div className="max-w-2xl mx-auto text-center space-y-4 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-annapoorna-100 text-annapoorna-800 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-annapoorna-600" />
              Complimentary Download
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-sage-900">
              The Six Lifestyle Pillars Starter Guide
            </h1>
            <p className="text-sm text-sage-600 leading-relaxed font-light">
              A comprehensive introductory guide to nourishing your metabolism, establishing restorative rhythms, and practicing mindful vitality.
            </p>
          </div>

          {downloadUrl ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-emerald-900">Your Guide is Ready!</h3>
              <p className="text-xs text-emerald-800">
                Click below to download your complimentary copy of the Six Pillars Starter Guide.
              </p>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                Download PDF Guide
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-sage-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-sage-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-annapoorna-600 hover:bg-annapoorna-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
              >
                {loading ? "Preparing your guide..." : "Send Me the Free Guide"}
              </button>
              <p className="text-[11px] text-sage-500 text-center">
                We respect your privacy. No spam. Unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
