"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Phone, Sparkles, Check, Heart, Shield, ArrowRight } from "lucide-react";
import { ApiClient } from "@/lib/api/client";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { PhoneOtpInput } from "@/components/auth/PhoneOtpInput";
import { UserAuthSession } from "@/types";

const PILLAR_GOALS = [
  { id: "nutrition", label: "Plant-Based Nutrition & Anti-inflammatory Diet", icon: "🥗" },
  { id: "movement", label: "Daily Functional Mobility & Strength", icon: "🏃" },
  { id: "sleep", label: "Restorative Sleep & Circadian Rhythm", icon: "😴" },
  { id: "mindfulness", label: "Breathwork, Meditation & Stress Relief", icon: "🧘" },
  { id: "community", label: "Supportive Group Circles & Accountability", icon: "🤝" },
  { id: "clean_living", label: "Toxin-Free Living & Clean Habits", icon: "🌿" },
];

export default function SignUpPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Basic Info & Auth, Step 2: Health Goals

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>(["nutrition", "sleep"]);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      setError(null);
      setStep(2);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.post<UserAuthSession>("/api/v1/auth/register", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone: phone || undefined,
        gender: gender || undefined,
        date_of_birth: dateOfBirth || undefined,
        health_goals: selectedGoals,
        terms_accepted: termsAccepted,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("annapoorna_token", res.access_token);
        localStorage.setItem("annapoorna_user", JSON.stringify(res.user));
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please check your details.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-sand-50/70 flex items-center justify-center min-h-[85vh]">
      <div className="max-w-lg w-full mx-4 bg-white p-8 sm:p-10 rounded-3xl border border-sand-200 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-annapoorna-100 text-annapoorna-800 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900">
            {step === 1 ? "Begin Your Wellness Journey" : "Personalize Your Health Goals"}
          </h1>
          <p className="text-xs text-sage-600">
            {step === 1
              ? "Join the Annapoorna community for personalized lifestyle care"
              : "Select the pillars you would like your care team to focus on"}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        {/* Step 1: Sign up Details & Auth Method */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Method Tabs */}
            <div className="grid grid-cols-2 p-1 bg-sand-100/70 rounded-2xl border border-sand-200">
              <button
                type="button"
                onClick={() => setAuthMethod("email")}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  authMethod === "email"
                    ? "bg-white text-sage-900 shadow-xs"
                    : "text-sage-600 hover:text-sage-900"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email & Password</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMethod("phone")}
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
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-sage-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sage-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sharma"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sage-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sage-700 mb-1">Create Password (Min. 8 chars) *</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-sage-700 mb-1">Phone (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sage-700 mb-1">Gender (Optional)</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
                    >
                      <option value="">Select...</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non_binary">Non-Binary</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-sage-800 hover:bg-sage-900 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Continue to Wellness Goals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-sage-700 mb-1">First Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-sage-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
                    />
                  </div>
                </div>

                <PhoneOtpInput
                  isSignUp={true}
                  onError={(msg) => setError(msg)}
                  extraDetails={{ firstName, lastName, healthGoals: selectedGoals }}
                />
              </div>
            )}

            {/* Social Logins */}
            <SocialAuthButtons onError={(msg) => setError(msg)} />
          </div>
        )}

        {/* Step 2: Health Goals & Lifestyle Intake */}
        {step === 2 && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-sage-800 uppercase tracking-wider">
                Select Your Primary Focus Areas
              </label>
              <div className="space-y-2">
                {PILLAR_GOALS.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-annapoorna-600 bg-annapoorna-50/70 text-sage-900 shadow-xs font-medium"
                          : "border-sand-200 bg-white hover:bg-sand-50/60 text-sage-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{goal.icon}</span>
                        <span className="text-xs sm:text-sm">{goal.label}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-annapoorna-600 bg-annapoorna-600 text-white"
                            : "border-sand-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-sage-600">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 rounded text-annapoorna-600 focus:ring-annapoorna-500 border-sand-300"
              />
              <label htmlFor="terms">
                I agree to the{" "}
                <Link href="/terms" className="text-annapoorna-700 underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-annapoorna-700 underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-full border border-sand-300 hover:bg-sand-50 text-sage-700 font-semibold text-sm transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !termsAccepted}
                className="w-2/3 py-3 rounded-full bg-sage-800 hover:bg-sage-900 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
              >
                <span>{loading ? "Creating Account..." : "Complete Sign Up"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="pt-2 text-center text-xs text-sage-600 border-t border-sand-200">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-annapoorna-700 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
