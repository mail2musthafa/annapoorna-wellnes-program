"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Phone, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { ApiClient } from "@/lib/api/client";
import { UserAuthSession } from "@/types";

interface PhoneOtpInputProps {
  onSuccess?: (session: UserAuthSession) => void;
  onError?: (errMessage: string) => void;
  redirectTo?: string;
  isSignUp?: boolean;
  extraDetails?: {
    firstName?: string;
    lastName?: string;
    healthGoals?: string[];
  };
}

export function PhoneOtpInput({
  onSuccess,
  onError,
  redirectTo = "/dashboard",
  isSignUp = false,
  extraDetails,
}: PhoneOtpInputProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 8) {
      if (onError) onError("Please enter a valid mobile number with country code (e.g. +91 98765 43210).");
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await ApiClient.post<{ message: string; demo_otp?: string }>(
        "/api/v1/auth/otp/send",
        {
          phone_number: phone.startsWith("+") ? phone : `+91${phone}`,
          channel,
        }
      );

      setStep("otp");
      setCountdown(60);
      setStatusMessage(
        res.demo_otp
          ? `Code sent via ${channel.toUpperCase()}! (Demo Code: ${res.demo_otp})`
          : `6-digit verification code sent to your ${channel === "whatsapp" ? "WhatsApp" : "mobile SMS"}.`
      );
    } catch (err: any) {
      if (onError) onError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      if (onError) onError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const res = await ApiClient.post<UserAuthSession>("/api/v1/auth/otp/verify", {
        phone_number: formattedPhone,
        otp_code: fullOtp,
        first_name: extraDetails?.firstName,
        last_name: extraDetails?.lastName,
        health_goals: extraDetails?.healthGoals,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("annapoorna_token", res.access_token);
        localStorage.setItem("annapoorna_user", JSON.stringify(res.user));
      }

      if (onSuccess) {
        onSuccess(res);
      } else {
        router.push(redirectTo);
      }
    } catch (err: any) {
      if (onError) onError(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sage-700 mb-1.5">Mobile Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sage-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sage-700 mb-1.5">Receive OTP via</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  channel === "whatsapp"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold"
                    : "border-sand-300 bg-white text-sage-700 hover:bg-sand-50"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setChannel("sms")}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  channel === "sms"
                    ? "border-sage-800 bg-sage-50 text-sage-900 font-semibold"
                    : "border-sand-300 bg-white text-sage-700 hover:bg-sand-50"
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-sage-700" />
                <span>Standard SMS</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-sage-800 hover:bg-sage-900 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Dispatching OTP..." : "Send Verification Code"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-sage-700">Enter 6-Digit Code</label>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-xs text-annapoorna-700 hover:underline font-medium"
              >
                Change Number
              </button>
            </div>
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-annapoorna-500 bg-white shadow-xs"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-sage-600 pt-1">
            <span>Didn't receive code?</span>
            <button
              type="button"
              disabled={countdown > 0 || loading}
              onClick={() => handleSendOtp()}
              className="text-annapoorna-700 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className="w-3 h-3" />
              <span>{countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-sage-800 hover:bg-sage-900 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? "Verifying..." : isSignUp ? "Complete Registration" : "Verify & Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
