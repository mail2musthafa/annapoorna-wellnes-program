"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { ApiClient } from "@/lib/api/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAccount = searchParams.get("account") || "";

  const [account, setAccount] = useState(initialAccount);
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await ApiClient.post("/api/v1/auth/password-reset/confirm", {
        email_or_phone: account,
        token,
        new_password: newPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please verify the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 bg-sand-50/70 flex items-center justify-center min-h-[80vh]">
      <div className="max-w-md w-full mx-4 bg-white p-8 sm:p-10 rounded-3xl border border-sand-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-800 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">Set New Password</h1>
          <p className="text-xs text-sage-600">Enter the recovery code sent to your email or phone</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-semibold text-sm">Password Reset Successful!</p>
            <p className="text-xs text-emerald-700">Redirecting you to sign in with your new password...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sage-700 mb-1">Account (Email or Mobile)</label>
              <input
                type="text"
                required
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sage-700 mb-1">6-Digit Recovery Code / Token</label>
              <input
                type="text"
                required
                placeholder="e.g. 123456"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white tracking-widest font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sage-700 mb-1">New Password (Min. 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sage-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-sage-800 hover:bg-sage-900 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <span>{loading ? "Updating..." : "Confirm & Set Password"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-sage-600 border-t border-sand-200">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-annapoorna-700 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sage-600">Loading reset page...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
