"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Mail, MessageSquare, Phone, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { ApiClient } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [channel, setChannel] = useState<"email" | "whatsapp" | "sms">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError("Please provide your email address or mobile number.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const isEmail = identifier.includes("@");
      const res = await ApiClient.post<{ message: string; demo_otp?: string }>(
        "/api/v1/auth/password-reset/request",
        {
          email: isEmail ? identifier : undefined,
          phone_number: !isEmail ? identifier : undefined,
          channel,
        }
      );

      setSuccessMsg(res.message);
      // Auto-navigate to reset-password after short delay
      setTimeout(() => {
        router.push(`/reset-password?account=${encodeURIComponent(identifier)}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to request password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 bg-sand-50/70 flex items-center justify-center min-h-[80vh]">
      <div className="max-w-md w-full mx-4 bg-white p-8 sm:p-10 rounded-3xl border border-sand-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-annapoorna-100 text-annapoorna-800 flex items-center justify-center mx-auto">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">Reset Password</h1>
          <p className="text-xs text-sage-600">Enter your email or phone number to receive a secure recovery code</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg} Redirecting to reset page...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sage-700 mb-1">Email or Mobile Number</label>
            <input
              type="text"
              required
              placeholder="you@example.com or +91 98765 43210"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sage-700 mb-1.5">Deliver Recovery Code Via</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel("email")}
                className={`py-2 px-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                  channel === "email"
                    ? "border-sage-800 bg-sage-50 text-sage-900"
                    : "border-sand-300 bg-white text-sage-600 hover:bg-sand-50"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className={`py-2 px-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                  channel === "whatsapp"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                    : "border-sand-300 bg-white text-sage-600 hover:bg-sand-50"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("sms")}
                className={`py-2 px-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                  channel === "sms"
                    ? "border-sage-800 bg-sage-50 text-sage-900"
                    : "border-sand-300 bg-white text-sage-600 hover:bg-sand-50"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>SMS</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-sage-800 hover:bg-sage-900 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            <span>{loading ? "Requesting..." : "Send Reset Code"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-sage-600 border-t border-sand-200">
          <Link href="/login" className="font-semibold text-annapoorna-700 hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
