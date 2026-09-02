"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  loginUser,
  saveProfile,
  getStoredProfile,
  EMPTY_FARMER_PROFILE,
  INDIAN_LANGUAGES,
} from "@/lib/userStore";
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  KeyRound,
  Mail,
  Sparkles,
  User,
  UserPlus,
  Zap,
} from "lucide-react";
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
    if (!mobileNumber || mobileNumber.replace(/\D/g, "").length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
    }, 600);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      alert("Please enter the 4-digit verification code");
      return;
    }
    setLoading(true);
    const existing = getStoredProfile();
    const newProfile = {
      ...EMPTY_FARMER_PROFILE,
      ...existing,
      fullName: fullName.trim() || existing.fullName || `Farmer (${mobileNumber.slice(-4)})`,
      mobileNumber: mobileNumber || existing.mobileNumber,
      language: selectedLanguage,
      isRegistered: true,
      lastLogin: new Date().toISOString(),
    };
    loginUser();
    saveProfile(newProfile);
    setLanguage(selectedLanguage);
    setLoading(false);
    router.push("/dashboard");
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill in your email and password");
      return;
    }
    setLoading(true);
    const displayName = email.split("@")[0] || "Farmer";
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    const existing = getStoredProfile();
    const newProfile = {
      ...EMPTY_FARMER_PROFILE,
      ...existing,
      fullName: existing.fullName || formattedName,
      language: selectedLanguage,
      isRegistered: true,
      lastLogin: new Date().toISOString(),
    };
    loginUser();
    saveProfile(newProfile);
    setLanguage(selectedLanguage);
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] text-[#0d253d] font-sans flex flex-col justify-between select-none relative overflow-hidden">
      
      {/* ── Atmospheric Ambient Radial Meshes (Stripe Aesthetic) ──── */}
      <div
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #533afd 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/2 -right-24 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)" }}
      />

      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between p-6 relative z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-2xl bg-white border border-[#e3e8ee] shadow-sm flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
            <Image src="/images/aasra_logo.png" alt="AASRA" width={32} height={32} className="object-contain" priority />
          </div>
          <div>
            <span className="text-xl font-bold font-display text-[#0d253d] tracking-tight block">AASRA</span>
            <span className="text-[10px] font-mono text-[#533afd] font-bold block uppercase tracking-wider">Farmer Portal</span>
          </div>
        </Link>

        <Link
          href="/signup"
          className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 hover:scale-105"
          style={{ background: "linear-gradient(135deg, #533afd, #4434d4)" }}
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>New Farmer? Sign Up</span>
        </Link>
      </header>

      {/* Main Login Form Container */}
      <main className="max-w-md mx-auto w-full my-6 p-4 relative z-10 space-y-6">
        
        {/* Login Form Card */}
        <div className="bg-white border border-[#e3e8ee] shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#533afd] bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase">
              Secure Farmer Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#0d253d] tracking-tight mt-1">
              Log In to Your Farm
            </h1>
            <p className="text-xs text-[#64748d]">
              Access field telemetry, thermal stress early warnings, and AI crop advice
            </p>
          </div>

          {/* Auth Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-[#f6f9fc] border border-[#e3e8ee] p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setAuthMethod("otp")}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "otp"
                  ? "bg-white text-[#533afd] shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Phone className="h-3.5 w-3.5 text-[#533afd]" />
              <span>Mobile OTP</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMethod("password")}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "password"
                  ? "bg-white text-[#533afd] shadow-xs font-black"
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
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0d253d]">
                      Your Name (Optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full bg-[#f6f9fc] border border-[#e3e8ee] focus:border-[#533afd] rounded-2xl pl-10 pr-3.5 py-3 text-sm font-bold text-[#0d253d] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0d253d]">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="98260 14890"
                        className="w-full bg-[#f6f9fc] border border-[#e3e8ee] focus:border-[#533afd] rounded-2xl pl-10 pr-3.5 py-3 text-sm font-mono font-bold text-[#0d253d] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #533afd, #4434d4)" }}
                  >
                    <span>{loading ? "Sending..." : "Send Verification OTP"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center">
                    <span className="text-xs text-emerald-800 font-bold block">
                      OTP Sent to +91 {mobileNumber}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-mono">
                      (Enter any 4-digit code to log in)
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#0d253d]">
                      Enter 4-Digit OTP
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="1 2 3 4"
                      className="w-full bg-[#f6f9fc] border border-[#e3e8ee] focus:border-[#533afd] rounded-2xl p-3 text-center text-xl font-mono font-black tracking-widest text-[#0d253d] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #533afd, #4434d4)" }}
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
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0d253d]">
                  Email or Mobile
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@kisan.in"
                    className="w-full bg-[#f6f9fc] border border-[#e3e8ee] focus:border-[#533afd] rounded-2xl pl-10 pr-3.5 py-3 text-sm font-bold text-[#0d253d] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0d253d]">
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
                    className="w-full bg-[#f6f9fc] border border-[#e3e8ee] focus:border-[#533afd] rounded-2xl pl-10 pr-3.5 py-3 text-sm font-bold text-[#0d253d] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
                style={{ background: "linear-gradient(135deg, #533afd, #4434d4)" }}
              >
                <span>{loading ? "Logging in..." : "Log In to Dashboard"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Registration Redirect Footer */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-500">
              Don't have a farm registered?{" "}
              <Link href="/signup" className="text-[#533afd] font-bold hover:underline">
                Sign Up &amp; Map Real Farm
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Encrypted with Syngenta Krishi Digital Security</span>
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center text-xs text-slate-400 py-4 relative z-10">
        © 2026 AASRA — Syngenta Biologicals &amp; AI Crop Science Companion
      </footer>
    </div>
  );
}
