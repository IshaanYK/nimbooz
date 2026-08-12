"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loginUser, saveProfile, EMPTY_FARMER_PROFILE, INDIAN_LANGUAGES } from "@/lib/userStore";
import { saveFieldToBackend } from "@/lib/api";
import { Phone, ArrowRight, ShieldCheck, CheckCircle2, Lock, KeyRound, Mail, Sparkles, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("hi");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newProfile = {
      ...EMPTY_FARMER_PROFILE,
      fullName: fullName.trim() || `Farmer (${mobileNumber.slice(-4)})`,
      mobileNumber,
      language: selectedLanguage,
    };
    loginUser();
    saveProfile(newProfile);
    // Sync field to backend API database
    try {
      await saveFieldToBackend({
        name: `${newProfile.fullName}'s Primary Farm`,
        crop: newProfile.primaryCrop,
        areaHa: newProfile.fieldAreaHa,
        center: [23.2599, 77.4126],
      });
    } catch (_) {}
    setLoading(false);
    router.push("/dashboard");
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const displayName = email.split("@")[0] || "Field Manager";
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    const newProfile = {
      ...EMPTY_FARMER_PROFILE,
      fullName: formattedName,
      language: selectedLanguage,
    };
    loginUser();
    saveProfile(newProfile);
    try {
      await saveFieldToBackend({
        name: `${newProfile.fullName}'s Farm`,
        crop: newProfile.primaryCrop,
        areaHa: newProfile.fieldAreaHa,
        center: [23.2599, 77.4126],
      });
    } catch (_) {}
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col justify-between p-4 sm:p-8 relative">
      
      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4 relative z-10 border-b border-slate-200 pb-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-32 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <Image src="/images/aasra_logo.png" alt="AASRA" fill className="object-contain p-0.5" priority />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-[#10B981] uppercase hidden sm:inline">
            AASRA · FARMER PORTAL
          </span>
        </Link>

        <Link href="/signup" className="text-xs font-extrabold text-slate-600 hover:text-[#10B981]">
          Need an account? <span className="text-[#10B981] underline">Sign Up</span>
        </Link>
      </header>

      {/* Main Login Form Container */}
      <main className="max-w-lg mx-auto w-full my-8 relative z-10 space-y-6">
        


        {/* Regular Login Form Card */}
        <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">PORTAL SIGN-IN</span>
            <h2 className="text-2xl font-black font-display text-slate-900 mt-1">Sign in to your farm</h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Enter your mobile number to access live weather & crop overwatch.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setAuthMethod("otp")}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                authMethod === "otp"
                  ? "bg-white text-[#10B981] font-black shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Mobile OTP Code
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod("password")}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                authMethod === "password"
                  ? "bg-white text-[#10B981] font-black shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Email & Password
            </button>
          </div>

          {/* OTP FORM */}
          {authMethod === "otp" && (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Full Name / पूरा नाम
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Suresh Kumar"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 pl-10 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Mobile Number / मोबाइल नंबर
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 pl-10 text-sm font-mono font-bold text-slate-900 focus:border-[#10B981] outline-none"
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                    Enter 4-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="1 2 3 4"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-center text-lg font-mono font-bold text-slate-900 tracking-widest focus:border-[#10B981] outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? "Verifying..." : otpSent ? "Verify & Open Dashboard" : "Send Mobile OTP"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* PASSWORD FORM */}
          {authMethod === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@aasra.farm"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 pl-10 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 pl-10 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? "Authenticating..." : "Sign In with Password"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-4 text-xs text-slate-500 font-mono">
        © 2026 AASRA — Syngenta Biologicals Yield Overwatch Platform
      </footer>
    </div>
  );
}
