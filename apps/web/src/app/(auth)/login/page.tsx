"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { ApiClient } from "@/lib/api/client";
import { UserAuthSession } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("member@annapoorna.local");
  const [password, setPassword] = useState("MemberPass123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
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
    <div className="py-20 bg-sand-50 flex items-center justify-center min-h-[70vh]">
      <div className="max-w-md w-full mx-4 bg-white p-8 sm:p-10 rounded-3xl border border-sand-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-800 flex items-center justify-center mx-auto">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">Member Sign In</h1>
          <p className="text-xs text-sage-600">Access your lifestyle programs, meal plans, and classes</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sage-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sage-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-sage-800 hover:bg-sage-900 text-white font-semibold text-sm transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Portal"}
          </button>
        </form>

        <div className="p-3 rounded-xl bg-sand-100/60 border border-sand-200 text-[11px] text-sage-600 space-y-1">
          <p className="font-semibold text-sage-800">Demo Seed Credentials:</p>
          <p>Member: <code className="text-annapoorna-700">member@annapoorna.local</code> / <code className="text-annapoorna-700">MemberPass123!</code></p>
          <p>Admin: <code className="text-annapoorna-700">admin@annapoorna.local</code> / <code className="text-annapoorna-700">AdminPass123!</code></p>
        </div>
      </div>
    </div>
  );
}
