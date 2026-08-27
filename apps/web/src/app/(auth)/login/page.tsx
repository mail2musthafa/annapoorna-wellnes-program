"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Phone, Lock } from "lucide-react";
import { ApiClient } from "@/lib/api/client";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { PhoneOtpInput } from "@/components/auth/PhoneOtpInput";
import { UserAuthSession } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("admin@annapoornawellness.org");
  const [password, setPassword] = useState("AdminPass123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.post<UserAuthSession>("/api/v1/auth/login", { email, password });
      if (typeof window !== "undefined") {
        localStorage.setItem("annapoorna_token", res.access_token);
        localStorage.setItem("annapoorna_user", JSON.stringify(res.user));
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-sand-50/70 flex items-center justify-center min-h-[80vh]">
      <div className="max-w-md w-full mx-4 bg-white p-8 sm:p-10 rounded-3xl border border-sand-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-800 flex items-center justify-center mx-auto">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">Sign In to Portal</h1>
          <p className="text-xs text-sage-600">Access your personalized care programs, appointments, and live classes</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        {/* Method Toggle */}
        <div className="grid grid-cols-2 p-1 bg-sand-100/70 rounded-2xl border border-sand-200">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("email");
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              authMethod === "email"
                ? "bg-white text-sage-900 shadow-xs"
                : "text-sage-600 hover:text-sage-900"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Password</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod("phone");
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              authMethod === "phone"
                ? "bg-white text-sage-900 shadow-xs"
                : "text-sage-600 hover:text-sage-900"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Mobile OTP</span>
          </button>
        </div>

        {authMethod === "email" ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sage-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-sage-700">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-annapoorna-700 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-sage-800 hover:bg-sage-900 text-white font-semibold text-sm transition-all shadow-xs disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In with Password"}
            </button>
          </form>
        ) : (
          <PhoneOtpInput onError={(msg) => setError(msg)} />
        )}

        {/* Social Auth */}
        <SocialAuthButtons onError={(msg) => setError(msg)} />

        {/* Sign up prompt */}
        <div className="pt-2 text-center text-xs text-sage-600 border-t border-sand-200">
          Don't have an account yet?{" "}
          <Link href="/signup" className="font-semibold text-annapoorna-700 hover:underline">
            Create Account
          </Link>
        </div>

        {/* Demo Seed Credentials Box */}
        <div className="p-3 rounded-2xl bg-sand-100/60 border border-sand-200 text-[11px] text-sage-600 space-y-1">
          <p className="font-semibold text-sage-800">Quick Test Credentials:</p>
          <p>Admin: <code className="text-annapoorna-700">admin@annapoornawellness.org</code> / <code className="text-annapoorna-700">AdminPass123!</code></p>
          <p>Member: <code className="text-annapoorna-700">priya.sharma@example.com</code> / <code className="text-annapoorna-700">MemberPass123!</code></p>
        </div>
      </div>
    </div>
  );
}
