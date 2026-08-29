"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { loginUser, saveProfile, getStoredProfile, EMPTY_FARMER_PROFILE, INDIAN_LANGUAGES } from "@/lib/userStore";
import { Phone, ArrowRight, ShieldCheck, CheckCircle2, Lock, KeyRound, Mail, Sparkles, User, UserPlus } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(language || "hi");
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
    const existing = getStoredProfile();
    const newProfile = {
      ...EMPTY_FARMER_PROFILE,
      ...existing,
      fullName: fullName.trim() || existing.fullName || `Farmer (${mobileNumber.slice(-4)})`,
      mobileNumber: mobileNumber || existing.mobileNumber,
      language: selectedLanguage,
    };
    loginUser();
    saveProfile(newProfile);
    setLanguage(selectedLanguage);
    setLoading(false);
    router.push("/dashboard");
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const displayName = email.split("@")[0] || "Farmer";
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    const existing = getStoredProfile();
    const newProfile = {
      ...EMPTY_FARMER_PROFILE,
      ...existing,
      fullName: existing.fullName || formattedName,
      language: selectedLanguage,
    };
    loginUser();
    saveProfile(newProfile);
    setLanguage(selectedLanguage);
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
            {t.brandName} · {t.portalSignIn}
          </span>
        </Link>

        <Link href="/signup" className="text-xs font-extrabold text-slate-600 hover:text-[#10B981] flex items-center gap-1.5">
          <UserPlus className="h-3.5 w-3.5" />
          <span>New Farmer? Sign Up</span>
        </Link>
      </header>

      {/* Main Login Form Container */}
      <main className="max-w-md mx-auto w-full my-8 relative z-10 space-y-6">
        
        {/* Regular Login Form Card */}
        <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900">
              {t.portalSignIn || "Farmer Portal Login"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Access your field telemetry, thermal stress warnings, and AI advice
            </p>
          </div>

          {/* Auth Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setAuthMethod("otp")}
              className={`py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "otp"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Phone className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Mobile OTP</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMethod("password")}
              className={`py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "password"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5 text-blue-600" />
              <span>Password / Email</span>
            </button>
          </div>

          {/* OTP FORM */}
          {authMethod === "otp" && (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      {t.fullNameLabel || "Your Full Name"}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      {t.mobileNumberLabel}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-sm font-mono font-bold text-slate-900 focus:border-[#10B981] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>{loading ? "Sending..." : "Send Verification OTP"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                    <span className="text-xs text-emerald-800 font-bold block">
                      OTP Sent to +91 {mobileNumber}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-mono">
                      (Enter any 4-digit code to log in)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                      Enter 4-Digit OTP
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="1 2 3 4"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-center text-xl font-mono font-black tracking-widest text-slate-900 focus:border-[#10B981] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verify &amp; Open Farm Dashboard</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* PASSWORD / EMAIL FORM */}
          {authMethod === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@kisan.in"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-sm font-bold text-slate-900 focus:border-[#10B981] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{loading ? "Logging in..." : "Log In to Dashboard"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Registration Redirect Footer */}
          <div className="border-t border-slate-200 pt-4 text-center">
            <p className="text-xs text-slate-600 font-medium">
              Don't have a farm registered?{" "}
              <Link href="/signup" className="text-[#10B981] font-black hover:underline">
                Sign Up &amp; Map Real Farm
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
          <ShieldCheck className="h-4 w-4 text-[#10B981]" />
          <span>Encrypted with Syngenta Krishi Digital Security</span>
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center text-xs text-slate-400 py-4 relative z-10">
        © 2026 AASRA (Syngenta Hackathon). All Rights Reserved.
      </footer>
    </div>
  );
}
